import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import { AuditLogger } from '../audit/audit.logger';
import { AuthService } from '../auth/auth.service';
import { EnvioEmail, MemoriaEnvioEmail } from '../email/envio-email';
import { Usuario } from '../usuario/usuario.entity';

describe('SPEC-001 identidade e autorização', () => {
  jest.setTimeout(60000);
  let app: INestApplication;
  let audit: AuditLogger;
  let email: MemoriaEnvioEmail;
  let dados: DataSource;

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = modulo.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    await modulo.get(AuthService).seedAdministrador();
    audit = modulo.get(AuditLogger);
    email = modulo.get(EnvioEmail) as MemoriaEnvioEmail;
    dados = modulo.get(DataSource);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  function semSegredo(texto: string) {
    expect(texto.toLowerCase()).not.toContain('secreta');
    expect(texto).not.toMatch(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/);
  }

  it('AC-001-08 seed cria exatamente um administrador e é idempotente', async () => {
    const segundo = await app.get(AuthService).seedAdministrador();
    expect(segundo.criado).toBe(false);
    const admins = await dados.getRepository(Usuario).find({ where: { email: 'mariana@estudaai.local' } });
    expect(admins).toHaveLength(1);
    expect(admins[0].perfil).toBe('administrador');
  });

  it('AC-001-01 e AC-001-02 cadastro de aluno e recusa de e-mail duplicado', async () => {
    const inicio = Date.now();
    const ok = await request(app.getHttpServer())
      .post('/auth/cadastro')
      .send({ nome: 'Lucas Almeida', email: 'lucas@exemplo.com', senha: 'secreta123' })
      .expect(201);
    expect(Date.now() - inicio).toBeLessThan(2000);
    expect(ok.body.perfil).toBe('aluno');
    expect(ok.body.senha).toBeUndefined();
    expect(ok.body.senhaHash).toBeUndefined();

    const salvo = await dados.getRepository(Usuario).findOneByOrFail({ email: 'lucas@exemplo.com' });
    expect(salvo.senhaHash).not.toBe('secreta123');
    expect(await bcrypt.compare('secreta123', salvo.senhaHash)).toBe(true);

    const duplicado = await request(app.getHttpServer())
      .post('/auth/cadastro')
      .send({ nome: 'Outro', email: 'lucas@exemplo.com', senha: 'outra' })
      .expect(409);
    expect(duplicado.body.message).toContain('já está cadastrado');
    const contas = await dados.getRepository(Usuario).count({ where: { email: 'lucas@exemplo.com' } });
    expect(contas).toBe(1);
  });

  it('AC-001-03 e AC-001-04 login aluno emite JWT; credencial inválida não emite', async () => {
    const ok = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'lucas@exemplo.com', senha: 'secreta123' })
      .expect(200);
    expect(ok.body.accessToken).toMatch(/^eyJ/);
    expect(ok.body.perfil).toBe('aluno');
    expect(ok.body.tokenType).toBe('Bearer');

    const falha = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'lucas@exemplo.com', senha: 'errada' })
      .expect(401);
    expect(falha.body.accessToken).toBeUndefined();
    expect(falha.body.message).toContain('E-mail ou senha inválidos');
  });

  it('AC-001-10 log de login não contém senha nem JWT', () => {
    const linhas = audit.linhas.filter((l) => l.event.startsWith('auth.login'));
    expect(linhas.some((l) => l.event === 'auth.login.ok')).toBe(true);
    expect(linhas.some((l) => l.event === 'auth.login.falha')).toBe(true);
    semSegredo(JSON.stringify(linhas));
  });

  it('AC-001-05 logout recusa o mesmo token em seguida', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'lucas@exemplo.com', senha: 'secreta123' })
      .expect(200);
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${body.accessToken}`)
      .expect(204);
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${body.accessToken}`)
      .expect(401);
  });

  it('AC-001-06 aluno não executa CRUD de categoria; anônimo também é recusado', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'lucas@exemplo.com', senha: 'secreta123' })
      .expect(200);
    await request(app.getHttpServer())
      .post('/categorias')
      .set('Authorization', `Bearer ${body.accessToken}`)
      .expect(403);
    await request(app.getHttpServer()).post('/categorias').expect(401);
    await request(app.getHttpServer())
      .post('/configuracao/llm')
      .set('Authorization', `Bearer ${body.accessToken}`)
      .expect(403);
  });

  it('AC-001-07 administrador não acompanha trilha; login admin emite perfil XOR', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'mariana@estudaai.local', senha: 'AdminTemp1' })
      .expect(200);
    expect(body.perfil).toBe('administrador');
    await request(app.getHttpServer())
      .post('/progresso/escolher-trilha')
      .set('Authorization', `Bearer ${body.accessToken}`)
      .expect(403);
    await request(app.getHttpServer())
      .post('/categorias')
      .set('Authorization', `Bearer ${body.accessToken}`)
      .send({ nome: 'Programação', descricao: 'Percursos de código e lógica.' })
      .expect(201);
  });

  it('cadastro público não cria administrador', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/auth/cadastro')
      .send({ nome: 'Tentativa', email: 'fake-admin@exemplo.com', senha: 'x' })
      .expect(201);
    expect(body.perfil).toBe('aluno');
  });

  it('AC-001-09 recuperação dispara envio sem revelar se o e-mail existe', async () => {
    email.enviados.length = 0;
    const visivel = await request(app.getHttpServer())
      .post('/auth/recuperacao')
      .send({ email: 'lucas@exemplo.com' })
      .expect(200);
    const inexistente = await request(app.getHttpServer())
      .post('/auth/recuperacao')
      .send({ email: 'naoexiste@exemplo.com' })
      .expect(200);
    expect(visivel.body.mensagem).toBe(inexistente.body.mensagem);
    expect(email.enviados).toHaveLength(1);
    expect(email.enviados[0].para).toBe('lucas@exemplo.com');
    expect(email.enviados[0].corpo).toMatch(/procedimento/i);
  });
});
