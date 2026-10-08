import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import { AuditLogger } from '../audit/audit.logger';
import { AuthService } from '../auth/auth.service';
import { CatalogoService } from './catalogo.service';
import { Categoria } from './categoria.entity';
import { Etapa } from './etapa.entity';
import { Trilha } from './trilha.entity';

describe('SPEC-003 trilhas pré-definidas e etapas', () => {
  jest.setTimeout(60000);
  let app: INestApplication;
  let audit: AuditLogger;
  let dados: DataSource;
  let tokenAdmin = '';
  let tokenAluno = '';
  let categoriaId = '';

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
      .send({ nome: 'Lucas Almeida', email: 'lucas.trilha@exemplo.com', senha: 'secreta123' })
      .expect(201);
    const aluno = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'lucas.trilha@exemplo.com', senha: 'secreta123' })
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
    if (app) {
      await app.close();
    }
  });

  async function criarTrilha(titulo: string) {
    const { body } = await request(app.getHttpServer())
      .post('/trilhas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ titulo, descricao: 'Percurso curado.', categoriaId })
      .expect(201);
    return body as { id: string; titulo: string; disponivel: boolean };
  }

  it('AC-003-05 aluno autenticado não cria trilha pré-definida', async () => {
    await request(app.getHttpServer())
      .post('/trilhas')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ titulo: 'Negada', descricao: 'Não deve persistir.', categoriaId })
      .expect(403);
    await request(app.getHttpServer())
      .post('/trilhas')
      .send({ titulo: 'Negada', descricao: 'Não deve persistir.', categoriaId })
      .expect(401);
    expect(await dados.getRepository(Trilha).count({ where: { titulo: 'Negada' } })).toBe(0);
  });

  it('AC-003-02 recusa disponibilizar trilha sem etapas', async () => {
    const trilha = await criarTrilha('Funções e gráficos');
    expect(trilha.disponivel).toBe(false);
    const recusa = await request(app.getHttpServer())
      .post(`/trilhas/${trilha.id}/publicar`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(409);
    expect(recusa.body.message).toContain('ao menos uma etapa');
    const salva = await dados.getRepository(Trilha).findOneByOrFail({ id: trilha.id });
    expect(salva.disponivel).toBe(false);
  });

  it('AC-003-01 e AC-003-06 publica trilha com etapa Markdown em menos de 2 s', async () => {
    const trilha = await criarTrilha('Lógica de programação');
    const markdown = '## Variáveis\n\n- `let`\n- `const`';
    const inicio = Date.now();
    await request(app.getHttpServer())
      .post(`/trilhas/${trilha.id}/etapas`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ titulo: 'Variáveis e tipos', conteudo: markdown })
      .expect(201);
    const publicada = await request(app.getHttpServer())
      .post(`/trilhas/${trilha.id}/publicar`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(201);
    expect(Date.now() - inicio).toBeLessThan(2000);
    expect(publicada.body.tipo).toBe('pré-definida');
    expect(publicada.body.disponivel).toBe(true);
    expect(publicada.body.quantidadeEtapas).toBe(1);
    expect(publicada.body.etapas[0].conteudo).toBe(markdown);
    expect(publicada.body.etapas[0].conteudo).not.toMatch(/^https?:\/\//);
    const etapa = await dados.getRepository(Etapa).findOneByOrFail({ id: publicada.body.etapas[0].id });
    expect(etapa.conteudo).toContain('`let`');
  });

  it('AC-003-03 remove uma etapa de três e compacta a ordem', async () => {
    const trilha = await criarTrilha('Estruturas de controle');
    for (const titulo of ['Se', 'Senão', 'Laço']) {
      await request(app.getHttpServer())
        .post(`/trilhas/${trilha.id}/etapas`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ titulo, conteudo: `## ${titulo}\n` })
        .expect(201);
    }
    const detalhe = await request(app.getHttpServer())
      .get(`/trilhas/${trilha.id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(200);
    const meio = detalhe.body.etapas.find((e: { titulo: string }) => e.titulo === 'Senão');
    const depois = await request(app.getHttpServer())
      .delete(`/trilhas/${trilha.id}/etapas/${meio.id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(200);
    expect(depois.body.etapas).toHaveLength(2);
    expect(depois.body.etapas.map((e: { titulo: string; ordem: number }) => [e.titulo, e.ordem])).toEqual([
      ['Se', 1],
      ['Laço', 2]
    ]);
  });

  it('AC-003-04 recusa remover a última etapa', async () => {
    const trilha = await criarTrilha('Condicionais');
    const comEtapa = await request(app.getHttpServer())
      .post(`/trilhas/${trilha.id}/etapas`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ titulo: 'Se e senão', conteudo: '## Condicionais\n' })
      .expect(201);
    const unica = comEtapa.body.etapas[0];
    const recusa = await request(app.getHttpServer())
      .delete(`/trilhas/${trilha.id}/etapas/${unica.id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(409);
    expect(recusa.body.message).toContain('última etapa');
    expect(await dados.getRepository(Etapa).count({ where: { trilha: { id: trilha.id } } })).toBe(1);
  });

  it('reordenação preserva a identidade das etapas', async () => {
    const trilha = await criarTrilha('Ordem das etapas');
    for (const titulo of ['A', 'B', 'C']) {
      await request(app.getHttpServer())
        .post(`/trilhas/${trilha.id}/etapas`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ titulo, conteudo: titulo })
        .expect(201);
    }
    const antes = (
      await request(app.getHttpServer())
        .get(`/trilhas/${trilha.id}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200)
    ).body.etapas as { id: string; titulo: string }[];
    const ids = [antes[2].id, antes[0].id, antes[1].id];
    const depois = await request(app.getHttpServer())
      .patch(`/trilhas/${trilha.id}/etapas/ordem`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ ids })
      .expect(200);
    expect(depois.body.etapas.map((e: { id: string; titulo: string; ordem: number }) => [e.id, e.titulo, e.ordem])).toEqual([
      [antes[2].id, 'C', 1],
      [antes[0].id, 'A', 2],
      [antes[1].id, 'B', 3]
    ]);
  });

  it('não classifica trilha pré-definida na sentinela Personalizada', async () => {
    const sentinela = await dados.getRepository(Categoria).findOneByOrFail({ nome: 'Personalizada' });
    await request(app.getHttpServer())
      .post('/trilhas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ titulo: 'Gerada', descricao: 'Não.', categoriaId: sentinela.id })
      .expect(400);
  });

  it('log de trilha não contém senha nem JWT', () => {
    const linhas = audit.linhas.filter((l) => l.event.startsWith('catalogo.trilha') || l.event.startsWith('catalogo.etapa'));
    expect(linhas.some((l) => l.event === 'catalogo.trilha.publicada')).toBe(true);
    expect(linhas.some((l) => l.event === 'catalogo.trilha.publicacao_recusada')).toBe(true);
    expect(linhas.some((l) => l.event === 'catalogo.etapa.remocao_recusada')).toBe(true);
    const texto = JSON.stringify(linhas);
    expect(texto.toLowerCase()).not.toContain('secreta');
    expect(texto).not.toMatch(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/);
  });
});
