import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AuditLogger } from '../audit/audit.logger';
import { Categoria } from '../catalogo/categoria.entity';
import { NOME_SENTINELA } from '../catalogo/catalogo.service';
import { Etapa } from '../catalogo/etapa.entity';
import { Trilha } from '../catalogo/trilha.entity';
import { ConfiguracaoLlmService } from '../config/configuracao-llm.service';
import { Progresso } from '../progresso/progresso.entity';
import { ProgressoResposta } from '../progresso/dto';
import { ProgressoService } from '../progresso/progresso.service';
import { Perfil } from '../usuario/perfil';
import { Usuario } from '../usuario/usuario.entity';
import { SolicitacaoTrilha } from './solicitacao-trilha.entity';
import { comTimeout, LLM_TIMEOUT_MS, PORTA_LLM, PortaLlm, validarRespostaLlm } from './porta-llm';

type Ator = { userId: string; email?: string; perfil?: Perfil };

const TIPO_PERSONALIZADA = 'personalizada' as const;
const TIPO_PRE_DEFINIDA = 'pré-definida' as const;

@Injectable()
export class PersonalizadaService {
  constructor(
    @Inject(PORTA_LLM) private readonly porta: PortaLlm,
    @Inject(LLM_TIMEOUT_MS) private readonly timeoutMs: number,
    private readonly config: ConfiguracaoLlmService,
    private readonly progresso: ProgressoService,
    private readonly dados: DataSource,
    @InjectRepository(Trilha) private readonly trilhas: Repository<Trilha>,
    @InjectRepository(Categoria) private readonly categorias: Repository<Categoria>,
    private readonly audit: AuditLogger
  ) {}

  async gerar(textoObjetivo: string, ator: Ator): Promise<ProgressoResposta> {
    const objetivo = textoObjetivo.trim();
    if (!objetivo) {
      throw new HttpException(
        {
          message: 'Descreva o objetivo de estudo. Nenhuma trilha foi criada.',
          codigo: 'json_invalido'
        },
        HttpStatus.BAD_REQUEST
      );
    }

    const habilitado = await this.config.habilitado();
    if (!habilitado) {
      await this.recusarDesligado(ator);
    }

    const trilhasPreAntes = await this.contarPreDefinidas();
    let bruto: unknown;
    try {
      const controle = new AbortController();
      bruto = await comTimeout(this.porta.gerarTrilha(objetivo, controle.signal), this.timeoutMs);
    } catch {
      this.audit.registrar({
        level: 'warn',
        event: 'llm.geracao.timeout',
        outcome: 'falha',
        email: ator.email,
        perfil: 'aluno',
        message: 'Timeout ou provedor mudo na geração de trilha (E2)'
      });
      throw new HttpException(
        {
          message:
            'O agente não respondeu a tempo. Nenhuma trilha personalizada foi criada. Você pode tentar de novo ou usar o catálogo.',
          codigo: 'timeout'
        },
        HttpStatus.GATEWAY_TIMEOUT
      );
    }

    const resposta = validarRespostaLlm(bruto);
    if (!resposta) {
      this.audit.registrar({
        level: 'warn',
        event: 'llm.geracao.json_invalido',
        outcome: 'falha',
        email: ator.email,
        perfil: 'aluno',
        message: 'respostaLLM insuficiente (E3)'
      });
      throw new HttpException(
        {
          message:
            'A resposta do agente veio incompleta. Nada foi gravado. Descreva o objetivo de outro modo ou use o catálogo.',
          codigo: 'json_invalido'
        },
        HttpStatus.UNPROCESSABLE_ENTITY
      );
    }

    if (!(await this.config.habilitado())) {
      await this.recusarDesligado(ator);
    }

    const sentinela = await this.categorias.findOne({ where: { nome: NOME_SENTINELA } });
    if (!sentinela) {
      throw new HttpException(
        {
          message: 'A categoria sentinela Personalizada não está disponível. Nenhuma trilha foi criada.',
          codigo: 'persistencia'
        },
        HttpStatus.CONFLICT
      );
    }

    let progressoId = '';
    try {
      progressoId = await this.dados.transaction(async (manager) => {
        const aluno = await manager.getRepository(Usuario).findOneByOrFail({ id: ator.userId });
        const sentinelaTx = await manager.getRepository(Categoria).findOneByOrFail({ id: sentinela.id });
        const trilha = await manager.getRepository(Trilha).save(
          manager.getRepository(Trilha).create({
            titulo: resposta.titulo.slice(0, 160),
            descricao: resposta.descricao,
            tipo: TIPO_PERSONALIZADA,
            disponivel: true,
            categoria: sentinelaTx
          })
        );
        const etapasRepo = manager.getRepository(Etapa);
        for (const [indice, etapa] of resposta.etapas.entries()) {
          await etapasRepo.save(
            etapasRepo.create({
              titulo: etapa.titulo.slice(0, 160),
              conteudo: etapa.conteudo,
              ordem: etapa.ordem || indice + 1,
              trilha
            })
          );
        }
        const progresso = await manager.getRepository(Progresso).save(
          manager.getRepository(Progresso).create({
            aluno,
            alunoId: aluno.id,
            trilha,
            trilhaId: trilha.id,
            ativo: true
          })
        );
        await manager.getRepository(SolicitacaoTrilha).save(
          manager.getRepository(SolicitacaoTrilha).create({
            textoObjetivo: objetivo,
            respostaLLM: JSON.stringify(resposta),
            aluno,
            alunoId: aluno.id,
            trilha,
            trilhaId: trilha.id
          })
        );
        return progresso.id;
      });
    } catch {
      this.audit.registrar({
        level: 'error',
        event: 'llm.geracao.persistencia_falhou',
        outcome: 'falha',
        email: ator.email,
        perfil: 'aluno',
        message: 'Falha após JSON válido; transação revertida'
      });
      throw new HttpException(
        {
          message: 'Não foi possível gravar a trilha personalizada. Nenhuma trilha órfã foi deixada.',
          codigo: 'persistencia'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    const trilhasPreDepois = await this.contarPreDefinidas();
    if (trilhasPreDepois !== trilhasPreAntes) {
      this.audit.registrar({
        level: 'error',
        event: 'llm.geracao.persistencia_falhou',
        outcome: 'falha',
        email: ator.email,
        perfil: 'aluno',
        message: 'Pré-definidas alteradas na geração (RB10)'
      });
    }

    this.audit.registrar({
      level: 'info',
      event: 'llm.geracao.ok',
      outcome: 'ok',
      email: ator.email,
      perfil: 'aluno',
      message: `Trilha personalizada criada: ${resposta.titulo}`
    });
    return this.progresso.obter(progressoId, ator);
  }

  private async recusarDesligado(ator: Ator): Promise<never> {
    const predefinidas = await this.contarPreDefinidas();
    const catalogoIndisponivel = predefinidas === 0;
    this.audit.registrar({
      level: 'warn',
      event: 'llm.geracao.recusada',
      outcome: 'recusado',
      email: ator.email,
      perfil: 'aluno',
      message: catalogoIndisponivel ? 'LLM desligado e catálogo vazio (E4)' : 'LLM desligado (AC-006-02)'
    });
    throw new HttpException(
      {
        message: catalogoIndisponivel
          ? 'Por enquanto não há trilhas publicadas e o agente está desligado. Nenhuma trilha nova foi criada.'
          : 'O agente está desligado. Nenhuma trilha nova foi criada. Use o catálogo.',
        codigo: catalogoIndisponivel ? 'catalogo_indisponivel' : 'llm_desligado',
        catalogoIndisponivel
      },
      HttpStatus.CONFLICT
    );
  }

  private contarPreDefinidas() {
    return this.trilhas.count({ where: { tipo: TIPO_PRE_DEFINIDA } });
  }
}
