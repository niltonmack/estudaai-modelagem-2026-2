import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogger } from '../audit/audit.logger';
import { Perfil } from '../usuario/perfil';
import { Categoria } from './categoria.entity';
import { NOME_SENTINELA } from './catalogo.service';
import { EtapaDto, EtapaResposta, ImpactoRemocao, ReordenarEtapasDto, TrilhaDto, TrilhaResposta } from './dto';
import { Etapa } from './etapa.entity';
import { Trilha } from './trilha.entity';
import { IndiceService } from '../indice/indice.service';
import { Progresso } from '../progresso/progresso.entity';

type Ator = { email?: string; perfil?: Perfil };

const TIPO_PRE_DEFINIDA = 'pré-definida' as const;

@Injectable()
export class TrilhaService {
  constructor(
    @InjectRepository(Trilha) private readonly trilhas: Repository<Trilha>,
    @InjectRepository(Etapa) private readonly etapas: Repository<Etapa>,
    @InjectRepository(Categoria) private readonly categorias: Repository<Categoria>,
    @InjectRepository(Progresso) private readonly progressos: Repository<Progresso>,
    private readonly audit: AuditLogger,
    private readonly indice: IndiceService
  ) {}

  async listar(): Promise<TrilhaResposta[]> {
    const lista = await this.trilhas.find({
      where: { tipo: TIPO_PRE_DEFINIDA },
      relations: ['categoria', 'etapas']
    });
    return lista
      .map((t) => this.paraResposta(t))
      .sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt'));
  }

  async obter(id: string): Promise<TrilhaResposta> {
    return this.paraResposta(await this.buscar(id));
  }

  async criar(dto: TrilhaDto, ator: Ator): Promise<TrilhaResposta> {
    const categoria = await this.categoriaParaPreDefinida(dto.categoriaId);
    const trilha = await this.trilhas.save(
      this.trilhas.create({
        titulo: this.texto(dto.titulo, 'O título da trilha é obrigatório.'),
        descricao: dto.descricao.trim(),
        tipo: TIPO_PRE_DEFINIDA,
        disponivel: false,
        categoria
      })
    );
    this.audit.registrar({
      level: 'info',
      event: 'catalogo.trilha.criada',
      outcome: 'ok',
      email: ator.email,
      perfil: ator.perfil ?? 'administrador',
      message: `Trilha pré-definida criada: ${trilha.titulo}`
    });
    return this.obter(trilha.id);
  }

  async alterar(id: string, dto: TrilhaDto, ator: Ator): Promise<TrilhaResposta> {
    const trilha = await this.buscar(id);
    trilha.titulo = this.texto(dto.titulo, 'O título da trilha é obrigatório.');
    trilha.descricao = dto.descricao.trim();
    if (dto.categoriaId !== trilha.categoria.id) {
      trilha.categoria = await this.categoriaParaPreDefinida(dto.categoriaId);
    }
    await this.trilhas.save(trilha);
    this.audit.registrar({
      level: 'info',
      event: 'catalogo.trilha.alterada',
      outcome: 'ok',
      email: ator.email,
      perfil: ator.perfil ?? 'administrador',
      message: `Trilha alterada: ${trilha.titulo}`
    });
    return this.obter(id);
  }

  async remover(id: string, ator: Ator): Promise<void> {
    const trilha = await this.buscar(id);
    const etapas = (trilha.etapas ?? []).map((etapa) => etapa.id);
    await this.trilhas.remove(trilha);
    await this.indice.sincronizar(id, etapas);
    this.audit.registrar({
      level: 'info',
      event: 'catalogo.trilha.removida',
      outcome: 'ok',
      email: ator.email,
      perfil: ator.perfil ?? 'administrador',
      message: `Trilha removida: ${trilha.titulo}`
    });
  }

  async publicar(id: string, ator: Ator): Promise<TrilhaResposta> {
    const trilha = await this.buscar(id);
    if (!this.rb03(trilha)) {
      this.audit.registrar({
        level: 'warn',
        event: 'catalogo.trilha.publicacao_recusada',
        outcome: 'recusado',
        email: ator.email,
        perfil: ator.perfil ?? 'administrador',
        message: `Publicação recusada (RB03): ${trilha.titulo}`
      });
      throw new ConflictException(
        `Não é possível disponibilizar «${trilha.titulo}»: a trilha precisa de categoria e ao menos uma etapa. Nada foi publicado.`
      );
    }
    trilha.disponivel = true;
    await this.trilhas.save(trilha);
    await this.indice.sincronizar(trilha.id);
    this.audit.registrar({
      level: 'info',
      event: 'catalogo.trilha.publicada',
      outcome: 'ok',
      email: ator.email,
      perfil: ator.perfil ?? 'administrador',
      message: `Trilha publicada: ${trilha.titulo}`
    });
    return this.obter(id);
  }

  async criarEtapa(trilhaId: string, dto: EtapaDto, ator: Ator): Promise<TrilhaResposta> {
    const trilha = await this.buscar(trilhaId);
    const ordem = (trilha.etapas?.length ?? 0) + 1;
    await this.etapas.save(
      this.etapas.create({
        titulo: this.texto(dto.titulo, 'O título da etapa é obrigatório.'),
        conteudo: this.texto(dto.conteudo, 'O conteúdo da etapa é obrigatório.'),
        ordem,
        trilha
      })
    );
    await this.indice.sincronizar(trilhaId);
    this.audit.registrar({
      level: 'info',
      event: 'catalogo.etapa.criada',
      outcome: 'ok',
      email: ator.email,
      perfil: ator.perfil ?? 'administrador',
      message: `Etapa criada na trilha ${trilha.titulo}`
    });
    return this.obter(trilhaId);
  }

  async alterarEtapa(
    trilhaId: string,
    etapaId: string,
    dto: EtapaDto,
    ator: Ator
  ): Promise<TrilhaResposta> {
    const trilha = await this.buscar(trilhaId);
    const etapa = this.etapaDaTrilha(trilha, etapaId);
    etapa.titulo = this.texto(dto.titulo, 'O título da etapa é obrigatório.');
    etapa.conteudo = this.texto(dto.conteudo, 'O conteúdo da etapa é obrigatório.');
    await this.etapas.save(etapa);
    await this.indice.sincronizar(trilhaId);
    this.audit.registrar({
      level: 'info',
      event: 'catalogo.etapa.alterada',
      outcome: 'ok',
      email: ator.email,
      perfil: ator.perfil ?? 'administrador',
      message: `Etapa alterada: ${etapa.titulo}`
    });
    return this.obter(trilhaId);
  }

  async removerEtapa(trilhaId: string, etapaId: string, ator: Ator): Promise<TrilhaResposta> {
    const trilha = await this.buscar(trilhaId);
    const etapa = this.etapaDaTrilha(trilha, etapaId);
    const impacto = await this.impactoDaRemocao(trilha, etapa);
    if (impacto.progressosVigentes > 0) {
      const mensagem = impacto.ultimaEtapa
        ? `Não é possível remover a etapa: a trilha «${trilha.titulo}» tem alunos acompanhando e ficaria sem etapas. Nada foi apagado.`
        : `Não é possível remover «${etapa.titulo}»: há alunos acompanhando esta trilha. Nada foi apagado.`;
      this.audit.registrar({
        level: 'warn',
        event: 'catalogo.etapa.remocao_recusada',
        outcome: 'recusado',
        email: ator.email,
        perfil: ator.perfil ?? 'administrador',
        message: `Remoção recusada (RB11): ${trilha.titulo} / ${etapa.titulo}`
      });
      throw new ConflictException({
        message: mensagem,
        remocaoRecusada: true,
        impacto
      });
    }
    if ((trilha.etapas?.length ?? 0) <= 1) {
      this.audit.registrar({
        level: 'warn',
        event: 'catalogo.etapa.remocao_recusada',
        outcome: 'recusado',
        email: ator.email,
        perfil: ator.perfil ?? 'administrador',
        message: `Remoção da última etapa recusada: ${trilha.titulo}`
      });
      throw new ConflictException(
        `Não é possível remover a última etapa de «${trilha.titulo}». A trilha ficaria sem etapas. Nada foi apagado.`
      );
    }
    await this.etapas.remove(etapa);
    await this.indice.sincronizar(trilhaId, [etapaId]);
    await this.compactarOrdem(trilhaId);
    this.audit.registrar({
      level: 'info',
      event: 'catalogo.etapa.removida',
      outcome: 'ok',
      email: ator.email,
      perfil: ator.perfil ?? 'administrador',
      message: `Etapa removida da trilha ${trilha.titulo}`
    });
    return this.obter(trilhaId);
  }

  private async impactoDaRemocao(trilha: Trilha, etapa: Etapa): Promise<ImpactoRemocao> {
    const progressos = await this.progressos.find({
      where: { trilhaId: trilha.id, ativo: true },
      relations: ['aluno', 'conclusoes']
    });
    const totalEtapas = trilha.etapas?.length ?? 0;
    return {
      etapaId: etapa.id,
      etapaTitulo: etapa.titulo,
      progressosVigentes: progressos.length,
      conclusoesDestaEtapa: progressos.filter((p) =>
        (p.conclusoes ?? []).some((c) => c.etapaId === etapa.id)
      ).length,
      ultimaEtapa: totalEtapas <= 1,
      alunos: progressos.map((p) => {
        const etapasConcluidas = p.conclusoes?.length ?? 0;
        return {
          nome: p.aluno?.nome ?? 'Aluno',
          etapasConcluidas,
          totalEtapas,
          percentualProgresso: totalEtapas === 0 ? 0 : etapasConcluidas / totalEtapas,
          concluiuEstaEtapa: (p.conclusoes ?? []).some((c) => c.etapaId === etapa.id)
        };
      })
    };
  }

  async reordenar(trilhaId: string, dto: ReordenarEtapasDto, ator: Ator): Promise<TrilhaResposta> {
    const trilha = await this.buscar(trilhaId);
    const atuais = new Set((trilha.etapas ?? []).map((e) => e.id));
    if (dto.ids.length !== atuais.size || dto.ids.some((id) => !atuais.has(id))) {
      throw new BadRequestException('A lista de etapas não corresponde à trilha. Nada foi reordenado.');
    }
    for (let i = 0; i < dto.ids.length; i += 1) {
      const etapa = this.etapaDaTrilha(trilha, dto.ids[i]);
      etapa.ordem = i + 1;
      await this.etapas.save(etapa);
    }
    this.audit.registrar({
      level: 'info',
      event: 'catalogo.etapa.reordenada',
      outcome: 'ok',
      email: ator.email,
      perfil: ator.perfil ?? 'administrador',
      message: `Etapas reordenadas na trilha ${trilha.titulo}`
    });
    return this.obter(trilhaId);
  }

  private async buscar(id: string): Promise<Trilha> {
    const trilha = await this.trilhas.findOne({
      where: { id, tipo: TIPO_PRE_DEFINIDA },
      relations: ['categoria', 'etapas']
    });
    if (!trilha) {
      throw new NotFoundException('Trilha não encontrada.');
    }
    return trilha;
  }

  private etapaDaTrilha(trilha: Trilha, etapaId: string): Etapa {
    const etapa = (trilha.etapas ?? []).find((e) => e.id === etapaId);
    if (!etapa) {
      throw new NotFoundException('Etapa não encontrada nesta trilha.');
    }
    return etapa;
  }

  private async categoriaParaPreDefinida(categoriaId: string): Promise<Categoria> {
    const categoria = await this.categorias.findOne({ where: { id: categoriaId } });
    if (!categoria) {
      throw new NotFoundException('Categoria não encontrada.');
    }
    if (categoria.nome === NOME_SENTINELA) {
      throw new BadRequestException(
        'Trilha pré-definida não usa a categoria sentinela Personalizada. Nada foi persistido.'
      );
    }
    return categoria;
  }

  private async compactarOrdem(trilhaId: string) {
    const restantes = await this.etapas.find({
      where: { trilha: { id: trilhaId } },
      order: { ordem: 'ASC' }
    });
    for (let i = 0; i < restantes.length; i += 1) {
      if (restantes[i].ordem !== i + 1) {
        restantes[i].ordem = i + 1;
        await this.etapas.save(restantes[i]);
      }
    }
  }

  private rb03(trilha: Trilha) {
    return Boolean(trilha.categoria?.id) && (trilha.etapas?.length ?? 0) >= 1;
  }

  private texto(valor: string, mensagem: string) {
    const limpo = valor.trim();
    if (!limpo) {
      throw new BadRequestException(mensagem);
    }
    return limpo;
  }

  private paraResposta(trilha: Trilha): TrilhaResposta {
    const etapas = [...(trilha.etapas ?? [])]
      .sort((a, b) => a.ordem - b.ordem)
      .map(
        (e): EtapaResposta => ({
          id: e.id,
          titulo: e.titulo,
          conteudo: e.conteudo,
          ordem: e.ordem
        })
      );
    return {
      id: trilha.id,
      titulo: trilha.titulo,
      descricao: trilha.descricao,
      tipo: TIPO_PRE_DEFINIDA,
      disponivel: trilha.disponivel,
      quantidadeEtapas: etapas.length,
      categoria: { id: trilha.categoria.id, nome: trilha.categoria.nome },
      etapas
    };
  }
}
