import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import { AuditLogger } from '../audit/audit.logger';
import { AuthService } from '../auth/auth.service';
import { CatalogoService, NOME_SENTINELA } from './catalogo.service';
import { Categoria } from './categoria.entity';
import { Trilha } from './trilha.entity';

describe('SPEC-002 categorias', () => {
  jest.setTimeout(60000);
  let app: INestApplication;
  let audit: AuditLogger;
  let dados: DataSource;
  let tokenAdmin = '';
  let tokenAluno = '';

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = modulo.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    await modulo.get(AuthService).seedAdministrador();
    await modulo.get(CatalogoService).seedPersonalizada();
    audit = modulo.get(AuditLogger);
    dados = modulo.get(DataSource);

    const admin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'mariana@estudaai.local', senha: 'AdminTemp1' })
      .expect(200);
    tokenAdmin = admin.body.accessToken;

    await request(app.getHttpServer())
      .post('/auth/cadastro')
      .send({ nome: 'Lucas Almeida', email: 'lucas.cat@exemplo.com', senha: 'secreta123' })
      .expect(201);
    const aluno = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'lucas.cat@exemplo.com', senha: 'secreta123' })
      .expect(200);
    tokenAluno = aluno.body.accessToken;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('AC-002-05 seed cria a sentinela Personalizada e é idempotente', async () => {
    const segundo = await app.get(CatalogoService).seedPersonalizada();
    expect(segundo.criado).toBe(false);
    const sentinelas = await dados.getRepository(Categoria).find({ where: { nome: NOME_SENTINELA } });
    expect(sentinelas).toHaveLength(1);
  });

  it('AC-002-01 admin cadastra categoria com nome e descrição em menos de 2 s', async () => {
    const inicio = Date.now();
    const ok = await request(app.getHttpServer())
      .post('/categorias')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nome: '  Matemática  ', descricao: 'Fundamentos para outras trilhas.' })
      .expect(201);
    expect(Date.now() - inicio).toBeLessThan(2000);
    expect(ok.body.nome).toBe('Matemática');
    expect(ok.body.descricao).toBe('Fundamentos para outras trilhas.');
    expect(ok.body.sentinela).toBe(false);
    expect(ok.body.quantidadeTrilhas).toBe(0);
    const salvo = await dados.getRepository(Categoria).findOneByOrFail({ nome: 'Matemática' });
    expect(salvo.descricao).toContain('Fundamentos');
  });

  it('AC-002-02 aluno autenticado e anônimo não cadastram categoria', async () => {
    await request(app.getHttpServer())
      .post('/categorias')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ nome: 'Negada', descricao: 'Não deve persistir.' })
      .expect(403);
    await request(app.getHttpServer())
      .post('/categorias')
      .send({ nome: 'Negada', descricao: 'Não deve persistir.' })
      .expect(401);
    const qtd = await dados.getRepository(Categoria).count({ where: { nome: 'Negada' } });
    expect(qtd).toBe(0);
  });

  it('consulta de categorias é exclusiva do administrador', async () => {
    const inicio = Date.now();
    const lista = await request(app.getHttpServer())
      .get('/categorias')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(200);
    expect(Date.now() - inicio).toBeLessThan(2000);
    expect(lista.body.some((c: { nome: string }) => c.nome === NOME_SENTINELA)).toBe(true);
    await request(app.getHttpServer())
      .get('/categorias')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .expect(403);
    await request(app.getHttpServer()).get('/categorias').expect(401);
  });

  it('admin altera categoria; sentinela não troca de nome', async () => {
    const criada = await request(app.getHttpServer())
      .post('/categorias')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nome: 'História', descricao: 'Versão inicial.' })
      .expect(201);
    const alterada = await request(app.getHttpServer())
      .patch(`/categorias/${criada.body.id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nome: 'História do Brasil', descricao: 'Percursos de contexto.' })
      .expect(200);
    expect(alterada.body.nome).toBe('História do Brasil');
    expect(alterada.body.descricao).toBe('Percursos de contexto.');

    const sentinela = (await request(app.getHttpServer())
      .get('/categorias')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(200)).body.find((c: { sentinela: boolean }) => c.sentinela);
    const recusaNome = await request(app.getHttpServer())
      .patch(`/categorias/${sentinela.id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nome: 'Outra', descricao: sentinela.descricao })
      .expect(400);
    expect(recusaNome.body.message).toContain('sentinela');
    const ainda = await dados.getRepository(Categoria).findOneByOrFail({ id: sentinela.id });
    expect(ainda.nome).toBe(NOME_SENTINELA);
  });

  it('AC-002-03 admin remove categoria sem trilhas', async () => {
    const criada = await request(app.getHttpServer())
      .post('/categorias')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nome: 'Temporária', descricao: 'Sem trilhas.' })
      .expect(201);
    await request(app.getHttpServer())
      .delete(`/categorias/${criada.body.id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(204);
    const restante = await dados.getRepository(Categoria).findOne({ where: { id: criada.body.id } });
    expect(restante).toBeNull();
  });

  it('AC-002-04 recusa remoção com trilha vinculada e preserva o catálogo', async () => {
    const criada = await request(app.getHttpServer())
      .post('/categorias')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nome: 'Programação', descricao: 'Percursos de código e lógica.' })
      .expect(201);
    const categoria = await dados.getRepository(Categoria).findOneByOrFail({ id: criada.body.id });
    await dados.getRepository(Trilha).save(
      dados.getRepository(Trilha).create({
        titulo: 'Lógica básica',
        descricao: 'Primeira trilha da área.',
        tipo: 'pré-definida',
        categoria
      })
    );
    const recusa = await request(app.getHttpServer())
      .delete(`/categorias/${criada.body.id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(409);
    expect(recusa.body.message).toContain('existem trilhas nesta categoria');
    const intacta = await dados.getRepository(Categoria).findOneByOrFail({ id: criada.body.id });
    expect(intacta.nome).toBe('Programação');
    expect(await dados.getRepository(Trilha).count({ where: { categoria: { id: criada.body.id } } })).toBe(1);
  });

  it('recusa remoção da sentinela Personalizada mesmo sem trilhas', async () => {
    const sentinela = await dados.getRepository(Categoria).findOneByOrFail({ nome: NOME_SENTINELA });
    const recusa = await request(app.getHttpServer())
      .delete(`/categorias/${sentinela.id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(409);
    expect(recusa.body.message).toContain('Personalizada');
    expect(await dados.getRepository(Categoria).count({ where: { nome: NOME_SENTINELA } })).toBe(1);
  });

  it('log de catálogo não contém senha nem JWT', () => {
    const linhas = audit.linhas.filter((l) => l.event.startsWith('catalogo.'));
    expect(linhas.some((l) => l.event === 'catalogo.categoria.criada')).toBe(true);
    expect(linhas.some((l) => l.event === 'catalogo.categoria.remocao_recusada')).toBe(true);
    const texto = JSON.stringify(linhas);
    expect(texto.toLowerCase()).not.toContain('secreta');
    expect(texto).not.toMatch(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/);
  });
});
