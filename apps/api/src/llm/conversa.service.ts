import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogger } from '../audit/audit.logger';
import { ConfiguracaoLlmService } from '../config/configuracao-llm.service';
import { Progresso } from '../progresso/progresso.entity';
import { Perfil } from '../usuario/perfil';
import { ConversaResposta, MensagemResposta } from './dto';
import { Mensagem } from './mensagem.entity';
import { comTimeout, LLM_TIMEOUT_MS, PORTA_LLM, PortaLlm } from './porta-llm';

type Ator = { userId: string; email?: string; perfil?: Perfil };

@Injectable()
export class ConversaService {
  constructor(
    @Inject(PORTA_LLM) private readonly porta: PortaLlm,
    @Inject(LLM_TIMEOUT_MS) private readonly timeoutMs: number,
    private readonly config: ConfiguracaoLlmService,
    @InjectRepository(Mensagem) private readonly mensagens: Repository<Mensagem>,
    @InjectRepository(Progresso) private readonly progressos: Repository<Progresso>,
    private readonly audit: AuditLogger
  ) {}

  async listar(progressoId: string, ator: Ator): Promise<ConversaResposta> {
    const progresso = await this.exigirProgressoAtivo(progressoId, ator);
    const habilitado = await this.config.habilitado();
    return this.montar(progresso, habilitado);
  }

  async enviar(progressoId: string, texto: string, ator: Ator): Promise<ConversaResposta> {
    const limpo = texto.trim();
    if (!limpo) {
      throw new HttpException(
        {
          message: 'Escreva uma mensagem. Nada foi gravado.',
          codigo: 'texto_invalido'
        },
        HttpStatus.BAD_REQUEST
      );
    }

    const progresso = await this.exigirProgressoAtivo(progressoId, ator);
    if (!(await this.config.habilitado())) {
      this.audit.registrar({
        level: 'warn',
        event: 'llm.conversa.recusada',
        outcome: 'recusado',
        email: ator.email,
        perfil: 'aluno',
        message: 'LLM desligado (AC-007-05)'
      });
      throw new HttpException(
        {
          message:
            'O agente está desligado. Nenhuma mensagem nova foi gravada. Continue pelo acompanhamento da trilha.',
          codigo: 'llm_desligado'
        },
        HttpStatus.CONFLICT
      );
    }

    const aluno = progresso.aluno;
    const trilha = progresso.trilha;

    await this.mensagens.save(
      this.mensagens.create({
        texto: limpo,
        origem: 'aluno',
        aluno,
        alunoId: aluno.id,
        trilha,
        trilhaId: trilha.id
      })
    );

    let respostaAgente: string;
    try {
      const controle = new AbortController();
      respostaAgente = (
        await comTimeout(
          this.porta.conversar(
            limpo,
            { titulo: trilha.titulo, descricao: trilha.descricao },
            controle.signal
          ),
          this.timeoutMs
        )
      ).trim();
      if (!respostaAgente) {
        throw new Error('resposta vazia');
      }
    } catch {
      this.audit.registrar({
        level: 'warn',
        event: 'llm.conversa.timeout',
        outcome: 'falha',
        email: ator.email,
        perfil: 'aluno',
        message: 'Timeout ou provedor mudo na conversa (E2 / OPEN-20)'
      });
      throw new HttpException(
        {
          message:
            'O agente não respondeu a tempo. O catálogo e as etapas desta trilha não foram alterados. Você pode tentar de novo ou voltar ao acompanhamento.',
          codigo: 'timeout'
        },
        HttpStatus.GATEWAY_TIMEOUT
      );
    }

    await this.mensagens.save(
      this.mensagens.create({
        texto: respostaAgente,
        origem: 'agente LLM',
        aluno,
        alunoId: aluno.id,
        trilha,
        trilhaId: trilha.id
      })
    );

    this.audit.registrar({
      level: 'info',
      event: 'llm.conversa.ok',
      outcome: 'ok',
      email: ator.email,
      perfil: 'aluno',
      message: `Turno gravado na trilha ${trilha.titulo}`
    });
    return this.montar(progresso, true);
  }

  private async exigirProgressoAtivo(progressoId: string, ator: Ator) {
    const progresso = await this.progressos.findOne({
      where: { id: progressoId },
      relations: ['trilha', 'trilha.categoria', 'aluno']
    });
    if (!progresso || progresso.alunoId !== ator.userId || !progresso.ativo) {
      this.audit.registrar({
        level: 'warn',
        event: 'llm.conversa.recusada',
        outcome: 'recusado',
        email: ator.email,
        perfil: 'aluno',
        message: 'Sem progresso ativo (OPEN-14 / AC-007-02)'
      });
      throw new HttpException(
        {
          message:
            'Sem uma trilha em andamento, a conversa não começa. Nenhuma mensagem foi gravada.',
          codigo: 'sem_progresso'
        },
        HttpStatus.CONFLICT
      );
    }
    return progresso;
  }

  private async montar(progresso: Progresso, llmHabilitado: boolean): Promise<ConversaResposta> {
    const lista = await this.mensagens.find({
      where: { alunoId: progresso.alunoId, trilhaId: progresso.trilhaId },
      order: { dataEnvio: 'ASC' }
    });
    return {
      progressoId: progresso.id,
      ativo: progresso.ativo,
      llmHabilitado,
      trilha: {
        id: progresso.trilha.id,
        titulo: progresso.trilha.titulo,
        descricao: progresso.trilha.descricao,
        tipo: progresso.trilha.tipo,
        categoria: {
          id: progresso.trilha.categoria.id,
          nome: progresso.trilha.categoria.nome
        }
      },
      mensagens: lista.map((m) => this.paraMensagem(m))
    };
  }

  private paraMensagem(mensagem: Mensagem): MensagemResposta {
    return {
      id: mensagem.id,
      texto: mensagem.texto,
      origem: mensagem.origem,
      dataEnvio: mensagem.dataEnvio.toISOString(),
      trilhaId: mensagem.trilhaId
    };
  }
}
