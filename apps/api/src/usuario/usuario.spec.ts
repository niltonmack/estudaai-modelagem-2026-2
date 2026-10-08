import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import { AuthService } from '../auth/auth.service';
import { CatalogoService } from '../catalogo/catalogo.service';
import { Usuario } from './usuario.entity';

describe('SPEC-008 gerenciar usuários', () => {
  jest.setTimeout(60000);
  let app: INestApplication;
  let dados: DataSource;
  let tokenAdmin = '';
  let tokenAluno = '';
  let adminId = '';
  let categoriaId = '';

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = modulo.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    await modulo.get(AuthService).seedAdministrador();
    await modulo.get(CatalogoService).seedPersonalizada();
    dados = modulo.get(DataSource);

    const admin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'mariana@estudaai.local', senha: 'AdminTemp1' })
      .expect(200);
    tokenAdmin = admin.body.accessToken;

    const mariana = await dados.getRepository(Usuario).findOneByOrFail({
      email: 'mariana@estudaai.local'
    });
    adminId = mariana.id;

    await request(app.getHttpServer())
      .post('/auth/cadastro')
      .send({ nome: 'Lucas Almeida', email: 'lucas.user@exemplo.com', senha: 'secreta123' })
      .expect(201);
    const aluno = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'lucas.user@exemplo.com', senha: 'secreta123' })
      .expect(200);
    tokenAluno = aluno.body.accessToken;

    const categoria = await request(app.getHttpServer())
      .post('/categorias')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nome: 'Programação', descricao: 'Percursos de código e lógica.' })
      .expect(201);
    categoriaId = categoria.body.id;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('AC-008-01 admin cadastra aluno e administrador com senha em hash em menos de 2 s', async () => {
    const inicio = Date.now();
    const aluno = await request(app.getHttpServer())
      .post('/usuarios')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nome: '  Ana Souza  ',
        email: 'Ana.User@exemplo.com',
        senha: 'secreta123',
        perfil: 'aluno'
      })
      .expect(201);
    expect(Date.now() - inicio).toBeLessThan(2000);
    expect(aluno.body.perfil).toBe('aluno');
    expect(aluno.body.email).toBe('ana.user@exemplo.com');
    expect(aluno.body.nome).toBe('Ana Souza');
    expect(aluno.body.senha).toBeUndefined();
    expect(aluno.body.senhaHash).toBeUndefined();
    const salvo = await dados.getRepository(Usuario).findOneByOrFail({ email: 'ana.user@exemplo.com' });
    expect(salvo.senhaHash).not.toBe('secreta123');
    expect(await bcrypt.compare('secreta123', salvo.senhaHash)).toBe(true);

    const segundoAdmin = await request(app.getHttpServer())
      .post('/usuarios')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nome: 'Paulo Admin',
        email: 'paulo.admin@exemplo.com',
        senha: 'AdminDois1',
        perfil: 'administrador'
      })
      .expect(201);
    expect(segundoAdmin.body.perfil).toBe('administrador');
  });

  it('AC-008-02 aluno autenticado e anônimo não listam nem criam contas', async () => {
    await request(app.getHttpServer())
      .get('/usuarios')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .expect(403);
    await request(app.getHttpServer())
      .post('/usuarios')
      .send({ nome: 'X', email: 'x@exemplo.com', senha: 'a', perfil: 'aluno' })
      .expect(401);
  });

  it('AC-008-03 e-mail duplicado recusa e não cria conta', async () => {
    const antes = await dados.getRepository(Usuario).count();
    const recusa = await request(app.getHttpServer())
      .post('/usuarios')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nome: 'Outro',
        email: 'lucas.user@exemplo.com',
        senha: 'outra',
        perfil: 'aluno'
      })
      .expect(409);
    expect(recusa.body.message).toMatch(/já está cadastrado/i);
    expect(await dados.getRepository(Usuario).count()).toBe(antes);
  });

  it('AC-008-04 e AC-008-05 último administrador e auto-remoção são recusados', async () => {
    const auto = await request(app.getHttpServer())
      .delete(`/usuarios/${adminId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(409);
    expect(auto.body.message).toMatch(/própria conta/i);

    const loginPaulo = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'paulo.admin@exemplo.com', senha: 'AdminDois1' })
      .expect(200);
    const paulo = await dados.getRepository(Usuario).findOneByOrFail({
      email: 'paulo.admin@exemplo.com'
    });
    await request(app.getHttpServer())
      .delete(`/usuarios/${paulo.id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(204);

    const perfil = await request(app.getHttpServer())
      .patch(`/usuarios/${adminId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ perfil: 'aluno' })
      .expect(409);
    expect(perfil.body.message).toMatch(/última conta de administrador/i);
    const ainda = await dados.getRepository(Usuario).findOneByOrFail({ id: adminId });
    expect(ainda.perfil).toBe('administrador');
  });

  it('AC-008-06 aluno com progresso não é removido nem promovido', async () => {
    const { body: trilha } = await request(app.getHttpServer())
      .post('/trilhas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ titulo: 'Lógica', descricao: 'Percurso.', categoriaId })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/trilhas/${trilha.id}/etapas`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ titulo: 'Variáveis', conteudo: 'Conteúdo.' })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/trilhas/${trilha.id}/publicar`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(201);
    await request(app.getHttpServer())
      .post('/progresso/escolher-trilha')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ trilhaId: trilha.id })
      .expect(201);

    const lucas = await dados.getRepository(Usuario).findOneByOrFail({
      email: 'lucas.user@exemplo.com'
    });
    const remocao = await request(app.getHttpServer())
      .delete(`/usuarios/${lucas.id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(409);
    expect(remocao.body.message).toMatch(/trilhas em acompanhamento/i);

    const promocao = await request(app.getHttpServer())
      .patch(`/usuarios/${lucas.id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ perfil: 'administrador' })
      .expect(409);
    expect(promocao.body.message).toMatch(/trilhas em acompanhamento/i);
    const intacto = await dados.getRepository(Usuario).findOneByOrFail({ id: lucas.id });
    expect(intacto.perfil).toBe('aluno');
  });

  it('AC-008-07 aluno sem progresso é removido', async () => {
    const ana = await dados.getRepository(Usuario).findOneByOrFail({ email: 'ana.user@exemplo.com' });
    await request(app.getHttpServer())
      .delete(`/usuarios/${ana.id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(204);
    expect(await dados.getRepository(Usuario).findOne({ where: { id: ana.id } })).toBeNull();
  });
});
