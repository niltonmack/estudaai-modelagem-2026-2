import {
  ConflictException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { AuditLogger } from '../audit/audit.logger';
import { EnvioEmail } from '../email/envio-email';
import { RecuperacaoSenha } from '../sessao/recuperacao-senha.entity';
import { TokenRevogado } from '../sessao/token-revogado.entity';
import { Perfil } from '../usuario/perfil';
import { Usuario } from '../usuario/usuario.entity';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    @InjectRepository(TokenRevogado) private readonly revogados: Repository<TokenRevogado>,
    @InjectRepository(RecuperacaoSenha) private readonly recuperacoes: Repository<RecuperacaoSenha>,
    private readonly jwt: JwtService,
    private readonly email: EnvioEmail,
    private readonly audit: AuditLogger
  ) {}

  async cadastrarAluno(nome: string, email: string, senha: string) {
    const existente = await this.usuarios.findOne({ where: { email: email.toLowerCase() } });
    if (existente) {
      this.audit.registrar({
        level: 'warn',
        event: 'auth.cadastro.email_duplicado',
        outcome: 'recusado',
        email: email.toLowerCase(),
        perfil: 'anonimo',
        message: 'Cadastro recusado: e-mail duplicado'
      });
      throw new ConflictException('Este e-mail já está cadastrado. Nenhuma conta nova foi criada.');
    }

    const usuario = this.usuarios.create({
      nome: nome.trim(),
      email: email.toLowerCase(),
      senhaHash: await bcrypt.hash(senha, 10),
      perfil: Perfil.Aluno
    });
    await this.usuarios.save(usuario);

    this.audit.registrar({
      level: 'info',
      event: 'auth.cadastro.ok',
      outcome: 'ok',
      email: usuario.email,
      perfil: 'aluno',
      message: 'Conta de aluno criada'
    });

    return { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil };
  }

  async login(email: string, senha: string) {
    const usuario = await this.usuarios.findOne({ where: { email: email.toLowerCase() } });
    const ok = usuario ? await bcrypt.compare(senha, usuario.senhaHash) : false;
    if (!usuario || !ok) {
      this.audit.registrar({
        level: 'warn',
        event: 'auth.login.falha',
        outcome: 'falha',
        email: email.toLowerCase(),
        perfil: 'anonimo',
        message: 'Credencial inválida'
      });
      throw new UnauthorizedException('E-mail ou senha inválidos. Nenhuma sessão foi iniciada.');
    }

    const jti = randomBytes(16).toString('hex');
    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
      jti
    };
    const accessToken = await this.jwt.signAsync(payload);

    this.audit.registrar({
      level: 'info',
      event: 'auth.login.ok',
      outcome: 'ok',
      email: usuario.email,
      perfil: usuario.perfil,
      message: 'JWT emitido'
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      perfil: usuario.perfil,
      nome: usuario.nome,
      email: usuario.email
    };
  }

  async logout(jti: string, email: string, perfil: Perfil) {
    const ja = await this.revogados.findOne({ where: { jti } });
    if (!ja) {
      await this.revogados.save(
        this.revogados.create({
          jti,
          expiraEm: new Date(Date.now() + 8 * 60 * 60 * 1000)
        })
      );
    }
    this.audit.registrar({
      level: 'info',
      event: 'auth.logout.ok',
      outcome: 'ok',
      email,
      perfil,
      message: 'Sessão encerrada'
    });
  }

  async solicitarRecuperacao(email: string) {
    const usuario = await this.usuarios.findOne({ where: { email: email.toLowerCase() } });
    this.audit.registrar({
      level: 'info',
      event: 'auth.recuperacao.solicitada',
      outcome: 'ok',
      email: email.toLowerCase(),
      perfil: usuario?.perfil ?? 'anonimo',
      message: 'Pedido de redefinição registrado'
    });

    if (!usuario) {
      return;
    }

    const token = randomBytes(24).toString('hex');
    await this.recuperacoes.save(
      this.recuperacoes.create({
        usuarioId: usuario.id,
        tokenHash: this.hashToken(token),
        expiraEm: new Date(Date.now() + 60 * 60 * 1000),
        usado: false
      })
    );

    await this.email.enviar({
      para: usuario.email,
      assunto: 'EstudaAI — redefinição de senha',
      corpo: `Use este procedimento para redefinir a senha: ${token}`
    });
  }

  async redefinirSenha(token: string, senha: string) {
    const tokenHash = this.hashToken(token);
    const pedido = await this.recuperacoes.findOne({ where: { tokenHash, usado: false } });
    if (!pedido || pedido.expiraEm.getTime() < Date.now()) {
      throw new UnauthorizedException('Procedimento inválido ou expirado.');
    }
    const usuario = await this.usuarios.findOne({ where: { id: pedido.usuarioId } });
    if (!usuario) {
      throw new UnauthorizedException('Procedimento inválido ou expirado.');
    }
    usuario.senhaHash = await bcrypt.hash(senha, 10);
    pedido.usado = true;
    await this.usuarios.save(usuario);
    await this.recuperacoes.save(pedido);
  }

  async seedAdministrador() {
    const email = (process.env.ADMIN_EMAIL ?? 'mariana@estudaai.local').toLowerCase();
    const existente = await this.usuarios.findOne({ where: { email } });
    if (existente) {
      return { criado: false, email };
    }
    const usuario = this.usuarios.create({
      nome: process.env.ADMIN_NOME ?? 'Mariana Costa',
      email,
      senhaHash: await bcrypt.hash(process.env.ADMIN_SENHA ?? 'AdminTemp1', 10),
      perfil: Perfil.Administrador
    });
    await this.usuarios.save(usuario);
    this.audit.registrar({
      level: 'info',
      event: 'auth.seed.admin',
      outcome: 'ok',
      email,
      perfil: 'administrador',
      message: 'Seed do primeiro administrador'
    });
    return { criado: true, email };
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
