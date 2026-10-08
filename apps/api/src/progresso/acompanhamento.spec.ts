import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import { AuthService } from '../auth/auth.service';
import { CatalogoService } from '../catalogo/catalogo.service';
import { ConfiguracaoLlmService } from '../config/configuracao-llm.service';
import { ConclusaoEtapa } from './conclusao-etapa.entity';
import { Progresso } from './progresso.entity';

describe('SPEC-009 consultar progresso dos alunos', () => {
  jest.setTimeout(60000);
  let app: INestApplication;
  let dados: DataSource;
  let tokenAdmin = '';
  let tokenAluno = '';
  let tokenAna = '';
  let lucasId = '';
  let anaId = '';
  let progressoId = '';
  let etapaId = '';
  let categoriaId = '';

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = modulo.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    await modulo.get(AuthService).seedAdministrador();
    await modulo.get(CatalogoService).seedPersonalizada();
    await modulo.get(ConfiguracaoLlmService).seed();
    dados = modulo.get(DataSource);

    const admin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'mariana@estudaai.local', senha: 'AdminTemp1' })
      .expect(200);
    tokenAdmin = admin.body.accessToken;

    const lucas = await request(app.getHttpServer())
      .post('/auth/cadastro')
      .send({ nome: 'Lucas Almeida', email: 'lucas.and@exemplo.com', senha: 'secreta123' })
      .expect(201);
    lucasId = lucas.body.id;
    const loginLucas = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'lucas.and@exemplo.com', senha: 'secreta123' })
      .expect(200);
    tokenAluno = loginLucas.body.accessToken;

    const ana = await request(app.getHttpServer())
      .post('/auth/cadastro')
      .send({ nome: 'Ana Souza', email: 'ana.and@exemplo.com', senha: 'secreta123' })
      .expect(201);
    anaId = ana.body.id;
    const loginAna = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ana.and@exemplo.com', senha: 'secreta123' })
      .expect(200);
    tokenAna = loginAna.body.accessToken;

    const categoria = await request(app.getHttpServer())
      .post('/categorias')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nome: 'Programação', descricao: 'Percursos de código e lógica.' })
      .expect(201);
    categoriaId = categoria.body.id;

    const { body: trilha } = await request(app.getHttpServer())
      .post('/trilhas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ titulo: 'Lógica de programação', descricao: 'Percurso.', categoriaId })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/trilhas/${trilha.id}/etapas`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ titulo: 'Variáveis', conteudo: 'Segredo do aluno.' })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/trilhas/${trilha.id}/etapas`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ titulo: 'Condicionais', conteudo: 'Mais conteúdo.' })
      .expect(201);
    const publicada = await request(app.getHttpServer())
      .post(`/trilhas/${trilha.id}/publicar`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(201);
    etapaId = publicada.body.etapas[0].id;

    const progresso = await request(app.getHttpServer())
      .post('/progresso/escolher-trilha')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ trilhaId: trilha.id })
      .expect(201);
    progressoId = progresso.body.id;
    await request(app.getHttpServer())
      .post(`/progresso/${progressoId}/etapas/${etapaId}/conclusao`)
      .set('Authorization', `Bearer ${tokenAluno}`)
      .expect(200);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('AC-009-01 admin vê o aluno, a trilha e o percentual derivado em menos de 2 s', async () => {
    const inicio = Date.now();
    const lista = await request(app.getHttpServer())
      .get('/acompanhamentos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(200);
    expect(Date.now() - inicio).toBeLessThan(2000);
    const lucas = lista.body.find((a: { email: string }) => a.email === 'lucas.and@exemplo.com');
    expect(lucas.quantidadeProgressos).toBe(1);
    expect(lucas.progressos[0].percentualProgresso).toBe(0.5);
    expect(lucas.progressos[0].etapasConcluidas).toBe(1);
    expect(lucas.progressos[0].totalEtapas).toBe(2);
    expect(lucas.progressos[0].trilha.titulo).toBe('Lógica de programação');
  });

  it('AC-009-02 aluno sem progresso aparece sem trilhas e nada é criado', async () => {
    const antes = await dados.getRepository(Progresso).count();
    const lista = await request(app.getHttpServer())
      .get('/acompanhamentos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(200);
    const ana = lista.body.find((a: { email: string }) => a.email === 'ana.and@exemplo.com');
    expect(ana.quantidadeProgressos).toBe(0);
    expect(ana.progressos).toEqual([]);
    const detalhe = await request(app.getHttpServer())
      .get(`/acompanhamentos/${anaId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(200);
    expect(detalhe.body.progressos).toEqual([]);
    expect(await dados.getRepository(Progresso).count()).toBe(antes);
  });

  it('AC-009-03 aluno autenticado e anônimo não consultam acompanhamentos', async () => {
    await request(app.getHttpServer())
      .get('/acompanhamentos')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .expect(403);
    await request(app.getHttpServer()).get('/acompanhamentos').expect(401);
  });

  it('AC-009-04 admin não marca conclusão nem escolhe trilha', async () => {
    const conclusoes = await dados.getRepository(ConclusaoEtapa).count();
    await request(app.getHttpServer())
      .post(`/progresso/${progressoId}/etapas/${etapaId}/conclusao`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(403);
    await request(app.getHttpServer())
      .post('/progresso/escolher-trilha')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ trilhaId: '00000000-0000-4000-8000-000000000000' })
      .expect(403);
    expect(await dados.getRepository(ConclusaoEtapa).count()).toBe(conclusoes);
  });

  it('AC-009-05 detalhe isola o progresso daquele aluno e omite o conteúdo das etapas', async () => {
    const detalhe = await request(app.getHttpServer())
      .get(`/acompanhamentos/${lucasId}/progressos/${progressoId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(200);
    expect(detalhe.body.percentualProgresso).toBe(0.5);
    expect(detalhe.body.trilha.etapas.every((e: { conteudo: string }) => e.conteudo === '')).toBe(true);
    await request(app.getHttpServer())
      .get(`/acompanhamentos/${anaId}/progressos/${progressoId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(404);
    expect(tokenAna).toBeTruthy();
  });
});
