import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { AuditLogger } from '../audit/audit.logger';
import { Progresso } from '../progresso/progresso.entity';
import { AlterarUsuarioDto, CriarUsuarioDto, UsuarioResposta } from './dto';
import { Perfil } from './perfil';
import { Usuario } from './usuario.entity';

type Ator = { userId: string; email?: string; perfil?: Perfil };

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    @InjectRepository(Progresso) private readonly progressos: Repository<Progresso>,
    private readonly audit: AuditLogger
  ) {}

  async listar(ator: Ator): Promise<UsuarioResposta[]> {
    const lista = await this.usuarios.find({ order: { nome: 'ASC' } });
    const respostas: UsuarioResposta[] = [];
    for (const usuario of lista) {
      respostas.push(await this.paraResposta(usuario, ator));
    }
    return respostas;
  }

  async obter(id: string, ator: Ator): Promise<UsuarioResposta> {
    return this.paraResposta(await this.buscar(id), ator);
  }

  async criar(dto: CriarUsuarioDto, ator: Ator): Promise<UsuarioResposta> {
    const email = this.normalizarEmail(dto.email);
    await this.garantirEmailLivre(email);
    const usuario = this.usuarios.create({
      nome: this.normalizarNome(dto.nome),
      email,
      senhaHash: await bcrypt.hash(dto.senha, 10),
      perfil: dto.perfil
    });
    await this.usuarios.save(usuario);
    this.audit.registrar({
      level: 'info',
      event: 'usuario.criado',
      outcome: 'ok',
      email: ator.email,
      perfil: ator.perfil ?? 'administrador',
      message: `Conta criada: ${usuario.email} (${usuario.perfil})`
    });
    return this.paraResposta(usuario, ator);
  }

  async alterar(id: string, dto: AlterarUsuarioDto, ator: Ator): Promise<UsuarioResposta> {
    const usuario = await this.buscar(id);
    const perfilAlvo = dto.perfil ?? usuario.perfil;

    if (dto.email && this.normalizarEmail(dto.email) !== usuario.email) {
      await this.garantirEmailLivre(this.normalizarEmail(dto.email));
    }

    if (perfilAlvo !== usuario.perfil) {
      await this.garantirTrocaPerfil(usuario, perfilAlvo, ator);
    }

    if (dto.nome) usuario.nome = this.normalizarNome(dto.nome);
    if (dto.email) usuario.email = this.normalizarEmail(dto.email);
    if (dto.senha) usuario.senhaHash = await bcrypt.hash(dto.senha, 10);
    usuario.perfil = perfilAlvo;
    await this.usuarios.save(usuario);

    this.audit.registrar({
      level: 'info',
      event: 'usuario.alterado',
      outcome: 'ok',
      email: ator.email,
      perfil: ator.perfil ?? 'administrador',
      message: `Conta alterada: ${usuario.email}`
    });
    return this.paraResposta(usuario, ator);
  }

  async remover(id: string, ator: Ator): Promise<void> {
    const usuario = await this.buscar(id);
    if (usuario.id === ator.userId) {
      this.audit.registrar({
        level: 'warn',
        event: 'usuario.remocao_recusada',
        outcome: 'recusado',
        email: ator.email,
        perfil: ator.perfil ?? 'administrador',
        message: `Auto-remoção recusada: ${usuario.email}`
      });
      throw new ConflictException(
        'Não é possível remover a própria conta. Nada foi apagado.'
      );
    }
    if (usuario.perfil === Perfil.Administrador) {
      await this.garantirNaoUltimoAdmin(usuario, 'remoção');
    }
    const quantidade = await this.progressos.count({ where: { alunoId: usuario.id } });
    if (quantidade > 0) {
      this.audit.registrar({
        level: 'warn',
        event: 'usuario.remocao_recusada',
        outcome: 'recusado',
        email: ator.email,
        perfil: ator.perfil ?? 'administrador',
        message: `Remoção recusada (aluno com progresso): ${usuario.email}`
      });
      throw new ConflictException(
        `Não é possível remover «${usuario.nome}»: há trilhas em acompanhamento. Nada foi apagado.`
      );
    }
    await this.usuarios.remove(usuario);
    this.audit.registrar({
      level: 'info',
      event: 'usuario.removido',
      outcome: 'ok',
      email: ator.email,
      perfil: ator.perfil ?? 'administrador',
      message: `Conta removida: ${usuario.email}`
    });
  }

  private async garantirTrocaPerfil(usuario: Usuario, perfilAlvo: Perfil, ator: Ator) {
    if (usuario.perfil === Perfil.Administrador && perfilAlvo === Perfil.Aluno) {
      await this.garantirNaoUltimoAdmin(usuario, 'alteração');
    }
    if (usuario.perfil === Perfil.Aluno && perfilAlvo === Perfil.Administrador) {
      const quantidade = await this.progressos.count({ where: { alunoId: usuario.id } });
      if (quantidade > 0) {
        this.audit.registrar({
          level: 'warn',
          event: 'usuario.alteracao_recusada',
          outcome: 'recusado',
          email: ator.email,
          perfil: ator.perfil ?? 'administrador',
          message: `Promoção recusada (aluno com progresso): ${usuario.email}`
        });
        throw new ConflictException(
          `Não é possível tornar «${usuario.nome}» administrador: há trilhas em acompanhamento. Nada foi alterado.`
        );
      }
    }
  }

  private async garantirNaoUltimoAdmin(usuario: Usuario, operacao: 'remoção' | 'alteração') {
    const admins = await this.usuarios.count({ where: { perfil: Perfil.Administrador } });
    if (admins <= 1) {
      this.audit.registrar({
        level: 'warn',
        event: operacao === 'remoção' ? 'usuario.remocao_recusada' : 'usuario.alteracao_recusada',
        outcome: 'recusado',
        email: usuario.email,
        perfil: 'administrador',
        message: `Último administrador recusado (${operacao}): ${usuario.email}`
      });
      throw new ConflictException(
        `Não é possível ${operacao === 'remoção' ? 'remover' : 'alterar'} «${usuario.nome}»: é a última conta de administrador. Nada foi alterado.`
      );
    }
  }

  private async garantirEmailLivre(email: string) {
    const existente = await this.usuarios.findOne({ where: { email } });
    if (existente) {
      throw new ConflictException('Este e-mail já está cadastrado. Nenhuma conta nova foi criada.');
    }
  }

  private async buscar(id: string): Promise<Usuario> {
    const usuario = await this.usuarios.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Conta não encontrada.');
    }
    return usuario;
  }

  private async paraResposta(usuario: Usuario, ator: Ator): Promise<UsuarioResposta> {
    const quantidadeProgressos = await this.progressos.count({ where: { alunoId: usuario.id } });
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      quantidadeProgressos,
      proprio: usuario.id === ator.userId
    };
  }

  private normalizarNome(nome: string) {
    return nome.trim();
  }

  private normalizarEmail(email: string) {
    return email.trim().toLowerCase();
  }
}
