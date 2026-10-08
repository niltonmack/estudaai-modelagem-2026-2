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
import { CategoriaDto, CategoriaResposta } from './dto';
import { Trilha } from './trilha.entity';

export const NOME_SENTINELA = 'Personalizada';
export const DESCRICAO_SENTINELA =
  'Reservada às trilhas geradas pelo agente. Não aparece como escolha do aluno.';

type Ator = { email?: string; perfil?: Perfil };

@Injectable()
export class CatalogoService {
  constructor(
    @InjectRepository(Categoria) private readonly categorias: Repository<Categoria>,
    @InjectRepository(Trilha) private readonly trilhas: Repository<Trilha>,
    private readonly audit: AuditLogger
  ) {}

  async seedPersonalizada() {
    const existente = await this.categorias.findOne({ where: { nome: NOME_SENTINELA } });
    if (existente) {
      return { criado: false, id: existente.id };
    }
    const categoria = await this.categorias.save(
      this.categorias.create({
        nome: NOME_SENTINELA,
        descricao: DESCRICAO_SENTINELA
      })
    );
    this.audit.registrar({
      level: 'info',
      event: 'catalogo.seed.personalizada',
      outcome: 'ok',
      perfil: 'administrador',
      message: 'Seed da categoria sentinela Personalizada'
    });
    return { criado: true, id: categoria.id };
  }

  async listar(): Promise<CategoriaResposta[]> {
    const lista = await this.categorias.find({ relations: ['trilhas'] });
    return lista
      .map((c) => this.paraResposta(c))
      .sort((a, b) => {
        if (a.sentinela !== b.sentinela) return a.sentinela ? 1 : -1;
        return a.nome.localeCompare(b.nome, 'pt');
      });
  }

  async obter(id: string): Promise<CategoriaResposta> {
    return this.paraResposta(await this.buscar(id));
  }

  async criar(dto: CategoriaDto, ator: Ator): Promise<CategoriaResposta> {
    const nome = this.normalizarNome(dto.nome);
    await this.garantirNomeLivre(nome);
    const categoria = await this.categorias.save(
      this.categorias.create({
        nome,
        descricao: dto.descricao.trim()
      })
    );
    this.audit.registrar({
      level: 'info',
      event: 'catalogo.categoria.criada',
      outcome: 'ok',
      email: ator.email,
      perfil: ator.perfil ?? 'administrador',
      message: `Categoria criada: ${nome}`
    });
    return this.paraResposta(categoria);
  }

  async alterar(id: string, dto: CategoriaDto, ator: Ator): Promise<CategoriaResposta> {
    const categoria = await this.buscar(id);
    const nome = this.normalizarNome(dto.nome);
    if (this.ehSentinela(categoria) && nome !== NOME_SENTINELA) {
      throw new BadRequestException(
        'O nome da categoria sentinela Personalizada não pode ser alterado. Nada foi modificado.'
      );
    }
    if (nome !== categoria.nome) {
      await this.garantirNomeLivre(nome);
    }
    categoria.nome = nome;
    categoria.descricao = dto.descricao.trim();
    await this.categorias.save(categoria);
    this.audit.registrar({
      level: 'info',
      event: 'catalogo.categoria.alterada',
      outcome: 'ok',
      email: ator.email,
      perfil: ator.perfil ?? 'administrador',
      message: `Categoria alterada: ${nome}`
    });
    return this.obter(id);
  }

  async remover(id: string, ator: Ator): Promise<void> {
    const categoria = await this.buscar(id);
    const quantidade = await this.trilhas.count({ where: { categoria: { id } } });
    if (this.ehSentinela(categoria)) {
      this.audit.registrar({
        level: 'warn',
        event: 'catalogo.categoria.remocao_recusada',
        outcome: 'recusado',
        email: ator.email,
        perfil: ator.perfil ?? 'administrador',
        message: 'Remoção da sentinela Personalizada recusada'
      });
      if (quantidade > 0) {
        throw new ConflictException(
          'A categoria sentinela «Personalizada» não pode ser removida enquanto houver trilhas personalizadas. O aluno e o LLM não a escolhem no catálogo.'
        );
      }
      throw new ConflictException(
        'A categoria sentinela «Personalizada» não pode ser removida. Nada foi apagado.'
      );
    }
    if (quantidade > 0) {
      this.audit.registrar({
        level: 'warn',
        event: 'catalogo.categoria.remocao_recusada',
        outcome: 'recusado',
        email: ator.email,
        perfil: ator.perfil ?? 'administrador',
        message: `Remoção recusada (RB13): ${categoria.nome}`
      });
      throw new ConflictException(
        `Não é possível remover «${categoria.nome}»: existem trilhas nesta categoria. Nada foi apagado.`
      );
    }
    await this.categorias.remove(categoria);
    this.audit.registrar({
      level: 'info',
      event: 'catalogo.categoria.removida',
      outcome: 'ok',
      email: ator.email,
      perfil: ator.perfil ?? 'administrador',
      message: `Categoria removida: ${categoria.nome}`
    });
  }

  private async buscar(id: string): Promise<Categoria> {
    const categoria = await this.categorias.findOne({
      where: { id },
      relations: ['trilhas']
    });
    if (!categoria) {
      throw new NotFoundException('Categoria não encontrada.');
    }
    return categoria;
  }

  private async garantirNomeLivre(nome: string) {
    const existente = await this.categorias.findOne({ where: { nome } });
    if (existente) {
      throw new ConflictException(`Já existe uma categoria chamada «${nome}». Nada foi persistido.`);
    }
  }

  private normalizarNome(nome: string) {
    const limpo = nome.trim();
    if (!limpo) {
      throw new BadRequestException('O nome da categoria é obrigatório.');
    }
    return limpo;
  }

  private ehSentinela(categoria: Categoria) {
    return categoria.nome === NOME_SENTINELA;
  }

  private paraResposta(categoria: Categoria): CategoriaResposta {
    return {
      id: categoria.id,
      nome: categoria.nome,
      descricao: categoria.descricao,
      quantidadeTrilhas: categoria.trilhas?.length ?? 0,
      sentinela: this.ehSentinela(categoria)
    };
  }
}
