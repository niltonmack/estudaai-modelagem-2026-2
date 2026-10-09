import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogger } from '../audit/audit.logger';
import { Trilha } from '../catalogo/trilha.entity';
import { ConfiguracaoLlmService } from '../config/configuracao-llm.service';
import { Perfil } from '../usuario/perfil';
import { Usuario } from '../usuario/usuario.entity';
import { ConclusaoEtapa } from './conclusao-etapa.entity';
import {
  AcompanhamentoAlunoResposta,
  AcompanhamentoListaItem,
  AcompanhamentoProgressoResumo,
  CatalogoPublicoResposta,
  ProgressoListaResposta,
  ProgressoResposta
} from './dto';
import { Progresso } from './progresso.entity';

type Ator = { userId: string; email?: string; perfil?: Perfil };

const TIPO_PRE_DEFINIDA = 'pré-definida' as const;
const TIPO_PERSONALIZADA = 'personalizada' as const;

@Injectable()
export class ProgressoService {
  constructor(
    @InjectRepository(Progresso) private readonly progressos: Repository<Progresso>,
    @InjectRepository(ConclusaoEtapa) private readonly conclusoes: Repository<ConclusaoEtapa>,
    @InjectRepository(Trilha) private readonly trilhas: Repository<Trilha>,
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    private readonly llm: ConfiguracaoLlmService,
    private readonly audit: AuditLogger
  ) {}

  async catalogoPublico(): Promise<CatalogoPublicoResposta> {
    const publicadas = await this.trilhas.find({
      where: [
        { tipo: TIPO_PRE_DEFINIDA, disponivel: true },
        { tipo: TIPO_PERSONALIZADA, disponivel: true }
      ],
      relations: ['categoria', 'etapas', 'autor']
    });
    const porCategoria = new Map<
      string,
      CatalogoPublicoResposta['categorias'][number]
    >();
    for (const trilha of publicadas) {
      const categoria = trilha.categoria;
      if (!categoria) continue;
      let grupo = porCategoria.get(categoria.id);
      if (!grupo) {
        grupo = { id: categoria.id, nome: categoria.nome, trilhas: [] };
        porCategoria.set(categoria.id, grupo);
      }
      grupo.trilhas.push({
        id: trilha.id,
        titulo: trilha.titulo,
        descricao: trilha.descricao,
        quantidadeEtapas: (trilha.etapas ?? []).length,
        autorNome: trilha.autor?.nome ?? null
      });
    }
    const categorias = [...porCategoria.values()]
      .map((g) => ({
        ...g,
        trilhas: g.trilhas.sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt'))
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt'));
    const llm = await this.llm.habilitado();
    const indisponivel = categorias.length === 0 && !llm;
    if (indisponivel) {
      this.audit.registrar({
        level: 'warn',
        event: 'catalogo.indisponivel',
        outcome: 'ok',
        perfil: 'anonimo',
        message: 'Catálogo vazio e LLM desligado (E4)'
      });
    }
    return { llmHabilitado: llm, indisponivel, categorias };
  }

  async escolher(trilhaId: string, ator: Ator): Promise<ProgressoResposta> {
    const trilha = await this.trilhas.findOne({
      where: { id: trilhaId, disponivel: true },
      relations: ['categoria', 'etapas', 'autor']
    });
    if (!trilha) {
      throw new NotFoundException(
        'Trilha não disponível no catálogo. Nenhum progresso foi iniciado.'
      );
    }
    const existente = await this.progressos.findOne({
      where: { alunoId: ator.userId, trilhaId: trilha.id }
    });
    if (existente) {
      this.audit.registrar({
        level: 'info',
        event: 'progresso.retomado',
        outcome: 'ok',
        email: ator.email,
        perfil: 'aluno',
        message: `Progresso retomado: ${trilha.titulo}`
      });
      const detalhe = await this.obter(existente.id, ator);
      return { ...detalhe, retomado: true };
    }

    const aluno = await this.usuarios.findOneByOrFail({ id: ator.userId });
    const criado = await this.progressos.save(
      this.progressos.create({
        aluno,
        alunoId: aluno.id,
        trilha,
        trilhaId: trilha.id,
        ativo: true
      })
    );
    this.audit.registrar({
      level: 'info',
      event: 'progresso.iniciado',
      outcome: 'ok',
      email: ator.email,
      perfil: 'aluno',
      message: `Progresso iniciado: ${trilha.titulo}`
    });
    const detalhe = await this.obter(criado.id, ator);
    return { ...detalhe, retomado: false };
  }

  async listar(ator: Ator): Promise<ProgressoListaResposta[]> {
    const lista = await this.progressos.find({
      where: { alunoId: ator.userId },
      relations: ['trilha', 'trilha.categoria', 'trilha.etapas', 'conclusoes', 'conclusoes.etapa'],
      order: { dataInicio: 'DESC' }
    });
    return lista.map((p) => this.paraLista(p));
  }

  async obter(id: string, ator: Ator): Promise<ProgressoResposta> {
    const progresso = await this.carregar(id);
    this.garantirDono(progresso, ator);
    return this.paraDetalhe(progresso);
  }

  async listarAcompanhamentos(ator: Ator): Promise<AcompanhamentoListaItem[]> {
    const alunos = await this.usuarios.find({
      where: { perfil: Perfil.Aluno },
      order: { nome: 'ASC' }
    });
    this.audit.registrar({
      level: 'info',
      event: 'acompanhamento.consultado',
      outcome: 'ok',
      email: ator.email,
      perfil: 'administrador',
      message: 'Lista de andamento dos alunos consultada'
    });
    const itens: AcompanhamentoListaItem[] = [];
    for (const aluno of alunos) {
      itens.push(await this.montarAcompanhamento(aluno, ator, false));
    }
    return itens;
  }

  async obterAcompanhamentoAluno(alunoId: string, ator: Ator): Promise<AcompanhamentoAlunoResposta> {
    const aluno = await this.usuarios.findOne({ where: { id: alunoId, perfil: Perfil.Aluno } });
    if (!aluno) {
      throw new NotFoundException('Aluno não encontrado.');
    }
    const montado = await this.montarAcompanhamento(aluno, ator, true);
    return { id: montado.id, nome: montado.nome, email: montado.email, progressos: montado.progressos };
  }

  async obterAcompanhamentoProgresso(
    alunoId: string,
    progressoId: string,
    ator: Ator
  ): Promise<ProgressoResposta> {
    const progresso = await this.carregar(progressoId);
    if (progresso.alunoId !== alunoId || progresso.aluno?.perfil !== Perfil.Aluno) {
      throw new NotFoundException('Progresso não encontrado para este aluno.');
    }
    this.audit.registrar({
      level: 'info',
      event: 'acompanhamento.consultado',
      outcome: 'ok',
      email: ator.email,
      perfil: 'administrador',
      message: `Detalhe de progresso consultado: ${progresso.trilha.titulo}`
    });
    const detalhe = this.paraDetalhe(progresso);
    return {
      ...detalhe,
      trilha: {
        ...detalhe.trilha,
        etapas: detalhe.trilha.etapas.map((e) => ({ ...e, conteudo: '' }))
      }
    };
  }

  async concluir(progressoId: string, etapaId: string, ator: Ator): Promise<ProgressoResposta> {
    const progresso = await this.carregar(progressoId);
    this.garantirDono(progresso, ator);
    const etapa = (progresso.trilha.etapas ?? []).find((e) => e.id === etapaId);
    if (!etapa) {
      throw new NotFoundException('Etapa não encontrada neste progresso.');
    }
    const ja = (progresso.conclusoes ?? []).find((c) => c.etapaId === etapaId);
    if (!ja) {
      await this.conclusoes.save(
        this.conclusoes.create({
          progresso,
          progressoId: progresso.id,
          etapa,
          etapaId: etapa.id
        })
      );
      this.audit.registrar({
        level: 'info',
        event: 'progresso.conclusao.ok',
        outcome: 'ok',
        email: ator.email,
        perfil: 'aluno',
        message: `Conclusão registrada: ${etapa.titulo}`
      });
    }
    return this.obter(progressoId, ator);
  }

  private async carregar(id: string): Promise<Progresso> {
    const progresso = await this.progressos.findOne({
      where: { id },
      relations: [
        'trilha',
        'trilha.categoria',
        'trilha.etapas',
        'trilha.autor',
        'conclusoes',
        'conclusoes.etapa',
        'aluno'
      ]
    });
    if (!progresso) {
      throw new NotFoundException('Progresso não encontrado.');
    }
    return progresso;
  }

  private garantirDono(progresso: Progresso, ator: Ator) {
    if (progresso.alunoId !== ator.userId) {
      throw new ForbiddenException('Operação recusada para este progresso.');
    }
  }

  private async montarAcompanhamento(
    aluno: Usuario,
    ator: Ator,
    detalhe: boolean
  ): Promise<AcompanhamentoListaItem> {
    const lista = await this.progressos.find({
      where: { alunoId: aluno.id },
      relations: ['trilha', 'trilha.categoria', 'trilha.etapas', 'conclusoes', 'conclusoes.etapa'],
      order: { dataInicio: 'DESC' }
    });
    if (detalhe) {
      this.audit.registrar({
        level: 'info',
        event: 'acompanhamento.consultado',
        outcome: 'ok',
        email: ator.email,
        perfil: 'administrador',
        message: `Andamento consultado: ${aluno.email}`
      });
    }
    return {
      id: aluno.id,
      nome: aluno.nome,
      email: aluno.email,
      quantidadeProgressos: lista.length,
      progressos: lista.map((p) => this.paraAcompanhamento(p))
    };
  }

  private paraAcompanhamento(progresso: Progresso): AcompanhamentoProgressoResumo {
    const d = this.derivado(progresso);
    return {
      id: progresso.id,
      dataInicio: progresso.dataInicio.toISOString(),
      ativo: progresso.ativo,
      percentualProgresso: d.percentualProgresso,
      etapasConcluidas: d.etapasConcluidas,
      totalEtapas: d.totalEtapas,
      trilha: {
        id: progresso.trilha.id,
        titulo: progresso.trilha.titulo,
        tipo: progresso.trilha.tipo,
        categoria: { id: progresso.trilha.categoria.id, nome: progresso.trilha.categoria.nome }
      },
      proximaEtapa: d.proxima
        ? { id: d.proxima.id, titulo: d.proxima.titulo, ordem: d.proxima.ordem }
        : null
    };
  }

  private derivado(progresso: Progresso) {
    const etapas = [...(progresso.trilha.etapas ?? [])].sort((a, b) => a.ordem - b.ordem);
    const porEtapa = new Map((progresso.conclusoes ?? []).map((c) => [c.etapaId, c]));
    const etapasConcluidas = etapas.filter((e) => porEtapa.has(e.id)).length;
    const totalEtapas = etapas.length;
    const percentualProgresso = totalEtapas === 0 ? 0 : etapasConcluidas / totalEtapas;
    const proxima = etapas.find((e) => !porEtapa.has(e.id));
    return { etapas, porEtapa, etapasConcluidas, totalEtapas, percentualProgresso, proxima };
  }

  private paraLista(progresso: Progresso): ProgressoListaResposta {
    const d = this.derivado(progresso);
    return {
      id: progresso.id,
      dataInicio: progresso.dataInicio.toISOString(),
      ativo: progresso.ativo,
      percentualProgresso: d.percentualProgresso,
      etapasConcluidas: d.etapasConcluidas,
      totalEtapas: d.totalEtapas,
      trilha: {
        id: progresso.trilha.id,
        titulo: progresso.trilha.titulo,
        tipo: progresso.trilha.tipo,
        categoria: { id: progresso.trilha.categoria.id, nome: progresso.trilha.categoria.nome }
      },
      proximaEtapa: d.proxima
        ? { id: d.proxima.id, titulo: d.proxima.titulo, ordem: d.proxima.ordem }
        : null
    };
  }

  private paraDetalhe(progresso: Progresso): ProgressoResposta {
    const d = this.derivado(progresso);
    const historico = [...(progresso.conclusoes ?? [])]
      .sort((a, b) => a.dataConclusao.getTime() - b.dataConclusao.getTime())
      .map((c) => ({
        etapaId: c.etapaId,
        titulo: c.etapa?.titulo ?? d.etapas.find((e) => e.id === c.etapaId)?.titulo ?? '',
        dataConclusao: c.dataConclusao.toISOString()
      }));
    return {
      id: progresso.id,
      dataInicio: progresso.dataInicio.toISOString(),
      ativo: progresso.ativo,
      percentualProgresso: d.percentualProgresso,
      etapasConcluidas: d.etapasConcluidas,
      totalEtapas: d.totalEtapas,
      trilha: {
        id: progresso.trilha.id,
        titulo: progresso.trilha.titulo,
        descricao: progresso.trilha.descricao,
        tipo: progresso.trilha.tipo,
        disponivel: progresso.trilha.disponivel,
        autorNome: progresso.trilha.autor?.nome ?? null,
        souAutor: progresso.trilha.autorId === progresso.alunoId,
        categoria: { id: progresso.trilha.categoria.id, nome: progresso.trilha.categoria.nome },
        etapas: d.etapas.map((e) => {
          const conclusao = d.porEtapa.get(e.id);
          return {
            id: e.id,
            titulo: e.titulo,
            conteudo: e.conteudo,
            ordem: e.ordem,
            concluida: Boolean(conclusao),
            dataConclusao: conclusao ? conclusao.dataConclusao.toISOString() : null
          };
        })
      },
      historico,
      proximaEtapa: d.proxima
        ? { id: d.proxima.id, titulo: d.proxima.titulo, ordem: d.proxima.ordem }
        : null
    };
  }
}
