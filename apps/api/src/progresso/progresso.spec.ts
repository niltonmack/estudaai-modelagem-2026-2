import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import { AuditLogger } from '../audit/audit.logger';
import { AuthService } from '../auth/auth.service';
import { CatalogoService } from '../catalogo/catalogo.service';
import { ConfiguracaoLlmService } from '../config/configuracao-llm.service';
import { Trilha } from '../catalogo/trilha.entity';
import { ConclusaoEtapa } from './conclusao-etapa.entity';
import { Progresso } from './progresso.entity';

describe('SPEC-004 acompanhar trilha pré-definida', () => {
  jest.setTimeout(60000);
  let app: INestApplication;
  let audit: AuditLogger;
  let dados: DataSource;
  let tokenAdmin = '';
  let tokenAluno = '';
  let tokenOutro = '';
  let categoriaId = '';

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = modulo.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    await modulo.get(AuthService).seedAdministrador();
    await modulo.get(CatalogoService).seedPersonalizada();
    await modulo.get(ConfiguracaoLlmService).seed();
    audit = modulo.get(AuditLogger);
    dados = modulo.get(DataSource);

    const admin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'mariana@estudaai.local', senha: 'AdminTemp1' })
      .expect(200);
    tokenAdmin = admin.body.accessToken;

    await request(app.getHttpServer())
      .post('/auth/cadastro')
      .send({ nome: 'Lucas Almeida', email: 'lucas.progresso@exemplo.com', senha: 'secreta123' })
      .expect(201);
    const aluno = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'lucas.progresso@exemplo.com', senha: 'secreta123' })
      .expect(200);
    tokenAluno = aluno.body.accessToken;

    await request(app.getHttpServer())
      .post('/auth/cadastro')
      .send({ nome: 'Ana Souza', email: 'ana.progresso@exemplo.com', senha: 'secreta123' })
      .expect(201);
    const outro = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ana.progresso@exemplo.com', senha: 'secreta123' })
      .expect(200);
    tokenOutro = outro.body.accessToken;

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

  async function publicarTrilha(titulo: string, etapas: { titulo: string; conteudo: string }[]) {
    const { body: trilha } = await request(app.getHttpServer())
      .post('/trilhas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ titulo, descricao: 'Percurso curado.', categoriaId })
      .expect(201);
    for (const etapa of etapas) {
      await request(app.getHttpServer())
        .post(`/trilhas/${trilha.id}/etapas`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(etapa)
        .expect(201);
    }
    const publicada = await request(app.getHttpServer())
      .post(`/trilhas/${trilha.id}/publicar`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(201);
    return publicada.body as { id: string; titulo: string; etapas: { id: string; titulo: string; ordem: number }[] };
  }

  it('AC-004-08 catálogo vazio e LLM desligado: E4, nenhuma trilha persistida', async () => {
    const antes = await dados.getRepository(Trilha).count();
    const inicio = Date.now();
    const { body } = await request(app.getHttpServer())
      .get('/catalogo')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .expect(200);
    expect(Date.now() - inicio).toBeLessThan(2000);
    expect(body.llmHabilitado).toBe(false);
    expect(body.indisponivel).toBe(true);
    expect(body.categorias).toEqual([]);
    expect(await dados.getRepository(Trilha).count()).toBe(antes);
    expect(audit.linhas.some((l) => l.event === 'catalogo.indisponivel')).toBe(true);
  });

  it('AC-004-01 anônimo lista catálogo publicado e não inicia progresso', async () => {
    const rascunho = await request(app.getHttpServer())
      .post('/trilhas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ titulo: 'Rascunho oculto', descricao: 'Não publicado.', categoriaId })
      .expect(201);
    const trilha = await publicarTrilha('Lógica de programação', [
      { titulo: 'Variáveis e tipos', conteudo: '## Variáveis\n\n- `let`\n- `const`' },
      { titulo: 'Condicionais', conteudo: '## Se e senão\n\nDesvio de fluxo.' },
      { titulo: 'Laços', conteudo: '## Repetição\n\n`for` e `while`.' }
    ]);

    const { body } = await request(app.getHttpServer()).get('/catalogo').expect(200);
    expect(body.indisponivel).toBe(false);
    const programacao = body.categorias.find((c: { nome: string }) => c.nome === 'Programação');
    expect(programacao).toBeDefined();
    const ids = programacao.trilhas.map((t: { id: string }) => t.id);
    expect(ids).toContain(trilha.id);
    expect(ids).not.toContain(rascunho.body.id);

    const recusa = await request(app.getHttpServer())
      .post('/progresso/escolher-trilha')
      .send({ trilhaId: trilha.id })
      .expect(401);
    expect(recusa.body.message).toBeDefined();
    expect(await dados.getRepository(Progresso).count({ where: { trilhaId: trilha.id } })).toBe(0);
  });

  it('AC-004-02 anônimo tenta escolher trilha e é recusado', async () => {
    const { body } = await request(app.getHttpServer()).get('/catalogo').expect(200);
    const trilhaId = body.categorias[0].trilhas[0].id;
    await request(app.getHttpServer()).post('/progresso/escolher-trilha').send({ trilhaId }).expect(401);
    await request(app.getHttpServer())
      .post(`/progresso/00000000-0000-4000-8000-000000000001/etapas/00000000-0000-4000-8000-000000000002/conclusao`)
      .expect(401);
  });

  it('AC-004-03 aluno escolhe trilha e vê etapas em ordem', async () => {
    const { body: catalogo } = await request(app.getHttpServer()).get('/catalogo').expect(200);
    const trilha = catalogo.categorias[0].trilhas.find(
      (t: { titulo: string }) => t.titulo === 'Lógica de programação'
    );
    const inicio = Date.now();
    const criada = await request(app.getHttpServer())
      .post('/progresso/escolher-trilha')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ trilhaId: trilha.id })
      .expect(201);
    expect(Date.now() - inicio).toBeLessThan(2000);
    expect(criada.body.retomado).toBe(false);
    expect(criada.body.ativo).toBe(true);
    expect(criada.body.percentualProgresso).toBe(0);
    expect(criada.body.etapasConcluidas).toBe(0);
    expect(criada.body.totalEtapas).toBe(3);
    expect(criada.body.trilha.etapas.map((e: { ordem: number }) => e.ordem)).toEqual([1, 2, 3]);
    expect(criada.body.trilha.etapas[0].conteudo).toContain('`let`');
    expect(criada.body.percentualProgresso).not.toBeUndefined();
    const linhas = audit.linhas.filter((l) => l.event === 'progresso.iniciado');
    expect(linhas.length).toBeGreaterThanOrEqual(1);
    expect(JSON.stringify(linhas)).not.toMatch(/eyJ/);
  });

  it('AC-004-04 e AC-004-05 conclusão explícita entra no percentual; etapa sem marcação não conta', async () => {
    const lista = await request(app.getHttpServer())
      .get('/progresso')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .expect(200);
    const progresso = lista.body[0];
    const detalhe = await request(app.getHttpServer())
      .get(`/progresso/${progresso.id}`)
      .set('Authorization', `Bearer ${tokenAluno}`)
      .expect(200);
    const primeira = detalhe.body.trilha.etapas[0];
    const segunda = detalhe.body.trilha.etapas[1];

    const marcada = await request(app.getHttpServer())
      .post(`/progresso/${progresso.id}/etapas/${primeira.id}/conclusao`)
      .set('Authorization', `Bearer ${tokenAluno}`)
      .expect(200);
    expect(marcada.body.etapasConcluidas).toBe(1);
    expect(marcada.body.totalEtapas).toBe(3);
    expect(marcada.body.percentualProgresso).toBeCloseTo(1 / 3);
    expect(marcada.body.trilha.etapas.find((e: { id: string }) => e.id === primeira.id).concluida).toBe(true);
    expect(marcada.body.trilha.etapas.find((e: { id: string }) => e.id === segunda.id).concluida).toBe(false);
    expect(marcada.body.historico).toHaveLength(1);

    const idempotente = await request(app.getHttpServer())
      .post(`/progresso/${progresso.id}/etapas/${primeira.id}/conclusao`)
      .set('Authorization', `Bearer ${tokenAluno}`)
      .expect(200);
    expect(idempotente.body.etapasConcluidas).toBe(1);
    expect(await dados.getRepository(ConclusaoEtapa).count({ where: { progressoId: progresso.id } })).toBe(1);
  });

  it('AC-004-06 escolher de novo retoma o mesmo Progresso.ativo', async () => {
    const { body: catalogo } = await request(app.getHttpServer()).get('/catalogo').expect(200);
    const trilha = catalogo.categorias[0].trilhas.find(
      (t: { titulo: string }) => t.titulo === 'Lógica de programação'
    );
    const primeiro = await request(app.getHttpServer())
      .get('/progresso')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .expect(200);
    const idOriginal = primeiro.body[0].id;
    const retomada = await request(app.getHttpServer())
      .post('/progresso/escolher-trilha')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ trilhaId: trilha.id })
      .expect(200);
    expect(retomada.body.id).toBe(idOriginal);
    expect(retomada.body.retomado).toBe(true);
    expect(retomada.body.etapasConcluidas).toBe(1);
    expect(await dados.getRepository(Progresso).count({ where: { trilhaId: trilha.id } })).toBe(1);
    expect(audit.linhas.some((l) => l.event === 'progresso.retomado')).toBe(true);
  });

  it('AC-004-07 administrador não inicia progresso', async () => {
    const { body: catalogo } = await request(app.getHttpServer()).get('/catalogo').expect(200);
    const trilhaId = catalogo.categorias[0].trilhas[0].id;
    const antes = await dados.getRepository(Progresso).count();
    await request(app.getHttpServer())
      .post('/progresso/escolher-trilha')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ trilhaId })
      .expect(403);
    expect(await dados.getRepository(Progresso).count()).toBe(antes);
  });

  it('progresso é individual: outro aluno não vê nem marca', async () => {
    const { body: catalogo } = await request(app.getHttpServer()).get('/catalogo').expect(200);
    const trilhaId = catalogo.categorias[0].trilhas.find(
      (t: { titulo: string }) => t.titulo === 'Lógica de programação'
    ).id;
    const doLucas = await request(app.getHttpServer())
      .get('/progresso')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .expect(200);
    await request(app.getHttpServer())
      .get(`/progresso/${doLucas.body[0].id}`)
      .set('Authorization', `Bearer ${tokenOutro}`)
      .expect(403);
    const daAna = await request(app.getHttpServer())
      .post('/progresso/escolher-trilha')
      .set('Authorization', `Bearer ${tokenOutro}`)
      .send({ trilhaId })
      .expect(201);
    expect(daAna.body.id).not.toBe(doLucas.body[0].id);
    expect(daAna.body.etapasConcluidas).toBe(0);
  });
});
