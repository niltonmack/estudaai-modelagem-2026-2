import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import { AuditLogger } from '../audit/audit.logger';
import { AuthService } from '../auth/auth.service';
import { CatalogoService, NOME_SENTINELA } from '../catalogo/catalogo.service';
import { Trilha } from '../catalogo/trilha.entity';
import { ConfiguracaoLlmService } from '../config/configuracao-llm.service';
import { Progresso } from '../progresso/progresso.entity';
import { FakeLlmAdapter, RESPOSTA_LLM_VALIDA } from './fake.adapter';
import { SolicitacaoTrilha } from './solicitacao-trilha.entity';
import { comTimeout, LlmTimeoutError, PORTA_LLM } from './porta-llm';

describe('SPEC-006 trilha personalizada', () => {
  jest.setTimeout(60000);
  let app: INestApplication;
  let audit: AuditLogger;
  let dados: DataSource;
  let fake: FakeLlmAdapter;
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
    await modulo.get(ConfiguracaoLlmService).seed();
    audit = modulo.get(AuditLogger);
    dados = modulo.get(DataSource);
    fake = modulo.get(PORTA_LLM) as FakeLlmAdapter;

    const admin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'mariana@estudaai.local', senha: 'AdminTemp1' })
      .expect(200);
    tokenAdmin = admin.body.accessToken;

    await request(app.getHttpServer())
      .post('/auth/cadastro')
      .send({ nome: 'Lucas Almeida', email: 'lucas.llm@exemplo.com', senha: 'secreta123' })
      .expect(201);
    const aluno = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'lucas.llm@exemplo.com', senha: 'secreta123' })
      .expect(200);
    tokenAluno = aluno.body.accessToken;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  afterEach(() => {
    fake.reset();
  });

  async function interruptor(habilitado: boolean) {
    await request(app.getHttpServer())
      .post('/configuracao/llm')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ habilitado })
      .expect(204);
  }

  async function publicarPredefinida() {
    if (categoriaId) {
      const { body } = await request(app.getHttpServer())
        .post('/trilhas')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ titulo: 'Lógica curada', descricao: 'Percurso pré-definido.', categoriaId })
        .expect(201);
      await request(app.getHttpServer())
        .post(`/trilhas/${body.id}/etapas`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ titulo: 'Variáveis', conteudo: '## Tipos' })
        .expect(201);
      await request(app.getHttpServer())
        .post(`/trilhas/${body.id}/publicar`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(201);
      return body.id as string;
    }
    const categoria = await request(app.getHttpServer())
      .post('/categorias')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nome: 'Programação', descricao: 'Percursos de código.' })
      .expect(201);
    categoriaId = categoria.body.id;
    return publicarPredefinida();
  }

  it('timeout 60 s no relógio de teste', async () => {
    const inicio = Date.now();
    await expect(comTimeout(new Promise(() => undefined), 40)).rejects.toBeInstanceOf(LlmTimeoutError);
    expect(Date.now() - inicio).toBeLessThan(1000);
  });

  it('AC-006-02 LLM off recusa geração; E4 se catálogo vazio', async () => {
    await interruptor(false);
    const antes = await dados.getRepository(Trilha).count();
    const { body: catalogo } = await request(app.getHttpServer()).get('/catalogo').expect(200);
    expect(catalogo.llmHabilitado).toBe(false);
    const recusa = await request(app.getHttpServer())
      .post('/solicitacoes-trilha')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ textoObjetivo: 'Quero aprender SQL.' })
      .expect(409);
    expect(await dados.getRepository(Trilha).count()).toBe(antes);
    expect(await dados.getRepository(SolicitacaoTrilha).count()).toBe(0);
    if (catalogo.indisponivel) {
      expect(recusa.body.codigo).toBe('catalogo_indisponivel');
      expect(recusa.body.message).toMatch(/desligado/);
    } else {
      expect(recusa.body.codigo).toBe('llm_desligado');
    }
  });

  it('AC-006-08 anônimo e admin não geram trilha', async () => {
    await interruptor(true);
    const antes = await dados.getRepository(Trilha).count();
    await request(app.getHttpServer())
      .post('/solicitacoes-trilha')
      .send({ textoObjetivo: 'Objetivo anônimo' })
      .expect(401);
    await request(app.getHttpServer())
      .post('/solicitacoes-trilha')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ textoObjetivo: 'Objetivo admin' })
      .expect(403);
    expect(await dados.getRepository(Trilha).count()).toBe(antes);
  });

  it('aluno consulta o interruptor; só o admin altera', async () => {
    await interruptor(true);
    const aluno = await request(app.getHttpServer())
      .get('/configuracao/llm')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .expect(200);
    expect(aluno.body.habilitado).toBe(true);
    await request(app.getHttpServer())
      .post('/configuracao/llm')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ habilitado: false })
      .expect(403);
    const ainda = await request(app.getHttpServer())
      .get('/configuracao/llm')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(200);
    expect(ainda.body.habilitado).toBe(true);
  });

  it('AC-006-01 geração feliz com adaptador falso: sentinela, progresso e SPEC-004', async () => {
    await interruptor(true);
    const { body } = await request(app.getHttpServer())
      .post('/solicitacoes-trilha')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({
        textoObjetivo: 'Quero analisar planilhas de vendas com SQL e montar consultas simples para totais por mês.'
      })
      .expect(201);
    expect(body.trilha.tipo).toBe('personalizada');
    expect(body.trilha.categoria.nome).toBe(NOME_SENTINELA);
    expect(body.trilha.titulo).toBe(RESPOSTA_LLM_VALIDA.titulo);
    expect(body.percentualProgresso).toBe(0);
    expect(body.totalEtapas).toBe(3);
    expect(body.trilha.etapas.map((e: { ordem: number }) => e.ordem)).toEqual([1, 2, 3]);
    expect(body.trilha.etapas[0].conteudo).toContain('WHERE');
    const solicitacao = await dados.getRepository(SolicitacaoTrilha).findOneByOrFail({ trilhaId: body.trilha.id });
    expect(solicitacao.textoObjetivo).toContain('planilhas');
    expect(solicitacao.alunoId).toBeDefined();
    const detalhe = await request(app.getHttpServer())
      .get(`/progresso/${body.id}`)
      .set('Authorization', `Bearer ${tokenAluno}`)
      .expect(200);
    expect(detalhe.body.trilha.tipo).toBe('personalizada');
    expect(audit.linhas.some((l) => l.event === 'llm.geracao.ok')).toBe(true);
  });

  it('AC-006-05 geração bem-sucedida não altera pré-definidas', async () => {
    await interruptor(true);
    await publicarPredefinida();
    const antes = await dados.getRepository(Trilha).count({ where: { tipo: 'pré-definida' } });
    const snapshot = await dados.getRepository(Trilha).find({ where: { tipo: 'pré-definida' } });
    await request(app.getHttpServer())
      .post('/solicitacoes-trilha')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ textoObjetivo: 'Outro objetivo de SQL.' })
      .expect(201);
    const depois = await dados.getRepository(Trilha).find({ where: { tipo: 'pré-definida' } });
    expect(depois).toHaveLength(antes);
    expect(depois.map((t) => `${t.id}:${t.titulo}:${t.descricao}`).sort()).toEqual(
      snapshot.map((t) => `${t.id}:${t.titulo}:${t.descricao}`).sort()
    );
    const adminLista = await request(app.getHttpServer())
      .get('/trilhas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(200);
    expect(adminLista.body.every((t: { tipo: string }) => t.tipo === 'pré-definida')).toBe(true);
  });

  it('AC-006-04 JSON sem etapas ou sem título não persiste trilha', async () => {
    await interruptor(true);
    const antesTrilha = await dados.getRepository(Trilha).count();
    const antesSolic = await dados.getRepository(SolicitacaoTrilha).count();
    fake.modo = 'sem_etapas';
    const semEtapas = await request(app.getHttpServer())
      .post('/solicitacoes-trilha')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ textoObjetivo: 'Objetivo incompleto.' })
      .expect(422);
    expect(semEtapas.body.codigo).toBe('json_invalido');
    fake.modo = 'sem_titulo';
    await request(app.getHttpServer())
      .post('/solicitacoes-trilha')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ textoObjetivo: 'Ainda incompleto.' })
      .expect(422);
    expect(await dados.getRepository(Trilha).count()).toBe(antesTrilha);
    expect(await dados.getRepository(SolicitacaoTrilha).count()).toBe(antesSolic);
  });

  it('AC-006-03 adaptador não responde: falha informada e nenhuma trilha', async () => {
    await interruptor(true);
    fake.modo = 'timeout';
    const antes = await dados.getRepository(Trilha).count();
    const falha = await request(app.getHttpServer())
      .post('/solicitacoes-trilha')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ textoObjetivo: 'Quero um percurso de SQL.' })
      .expect(504);
    expect(falha.body.codigo).toBe('timeout');
    expect(falha.body.message).toMatch(/a tempo/);
    expect(await dados.getRepository(Trilha).count()).toBe(antes);
  });

  it('transação: falha após JSON válido não deixa trilha órfã', async () => {
    await interruptor(true);
    const antesTrilha = await dados.getRepository(Trilha).count();
    const antesSolic = await dados.getRepository(SolicitacaoTrilha).count();
    const spy = jest.spyOn(dados, 'transaction').mockRejectedValueOnce(new Error('falha de persistência'));
    const falha = await request(app.getHttpServer())
      .post('/solicitacoes-trilha')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ textoObjetivo: 'Objetivo válido com JSON ok.' })
      .expect(500);
    spy.mockRestore();
    expect(falha.body.codigo).toBe('persistencia');
    expect(await dados.getRepository(Trilha).count()).toBe(antesTrilha);
    expect(await dados.getRepository(SolicitacaoTrilha).count()).toBe(antesSolic);
  });

  it('AC-006-06 admin desliga o LLM e novas gerações são recusadas', async () => {
    await interruptor(true);
    await interruptor(false);
    const antes = await dados.getRepository(Trilha).count();
    const recusa = await request(app.getHttpServer())
      .post('/solicitacoes-trilha')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ textoObjetivo: 'Depois do interruptor.' })
      .expect(409);
    expect(['llm_desligado', 'catalogo_indisponivel']).toContain(recusa.body.codigo);
    expect(await dados.getRepository(Trilha).count()).toBe(antes);
    expect(audit.linhas.some((l) => l.event === 'llm.interruptor.alterado')).toBe(true);
  });

  it('caminho local da SPEC-004 continua < 2 s com geração em curso', async () => {
    await interruptor(true);
    fake.atrasoMs = 400;
    const geracao = request(app.getHttpServer())
      .post('/solicitacoes-trilha')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ textoObjetivo: 'Geração lenta para não bloquear o catálogo.' });
    const geracaoP = Promise.resolve(geracao);
    await Promise.all([
      geracaoP,
      (async () => {
        const inicio = Date.now();
        await request(app.getHttpServer()).get('/catalogo').expect(200);
        expect(Date.now() - inicio).toBeLessThan(2000);
      })()
    ]);
    const gerada = await geracaoP;
    expect(gerada.status).toBe(201);
  });

  it('AC-006-07 chave Gemini não está no frontend Next.js', () => {
    const raiz = join(__dirname, '..', '..', '..', 'web');
    const proibidos = [/GEMINI_API_KEY/, /generativelanguage\.googleapis/, /AIza[0-9A-Za-z_-]{20,}/];
    for (const arquivo of listarArquivos(raiz)) {
      const texto = readFileSync(arquivo, 'utf8');
      for (const padrao of proibidos) {
        expect(texto).not.toMatch(padrao);
      }
    }
  });

  it('AC-010-01 incluir etapa conserva conclusões e o mesmo progresso', async () => {
    await interruptor(true);
    const criada = await request(app.getHttpServer())
      .post('/solicitacoes-trilha')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ textoObjetivo: 'Trilha para incluir uma etapa.' })
      .expect(201);
    const primeira = criada.body.trilha.etapas[0];
    await request(app.getHttpServer())
      .post(`/progresso/${criada.body.id}/etapas/${primeira.id}/conclusao`)
      .set('Authorization', `Bearer ${tokenAluno}`)
      .expect(200);
    const pedido = await request(app.getHttpServer())
      .get(`/solicitacoes-trilha/${criada.body.id}`)
      .set('Authorization', `Bearer ${tokenAluno}`)
      .expect(200);
    expect(pedido.body.textoObjetivo).toContain('incluir uma etapa');
    const antesPre = await dados.getRepository(Trilha).count({ where: { tipo: 'pré-definida' } });
    const revista = await request(app.getHttpServer())
      .post(`/solicitacoes-trilha/${criada.body.id}`)
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ textoObjetivo: 'Inclua uma etapa sobre índices.' })
      .expect(201);
    expect(revista.body.id).toBe(criada.body.id);
    expect(revista.body.trilha.id).toBe(criada.body.trilha.id);
    expect(revista.body.totalEtapas).toBe(4);
    expect(revista.body.etapasConcluidas).toBe(1);
    const conservada = revista.body.trilha.etapas.find((e: { id: string }) => e.id === primeira.id);
    expect(conservada.concluida).toBe(true);
    const nova = revista.body.trilha.etapas.find((e: { titulo: string }) => e.titulo === 'Etapa incluída');
    expect(nova.concluida).toBe(false);
    const solicitacao = await dados.getRepository(SolicitacaoTrilha).findOneByOrFail({
      trilhaId: criada.body.trilha.id
    });
    expect(solicitacao.textoObjetivo).toContain('índices');
    expect(await dados.getRepository(Trilha).count({ where: { tipo: 'pré-definida' } })).toBe(antesPre);
    expect(await dados.getRepository(Progresso).count({ where: { trilhaId: criada.body.trilha.id } })).toBe(1);
  });

  it('AC-010-02 excluir etapa concluída remove só a conclusão dela', async () => {
    await interruptor(true);
    const criada = await request(app.getHttpServer())
      .post('/solicitacoes-trilha')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ textoObjetivo: 'Trilha para excluir uma etapa.' })
      .expect(201);
    const [mantida, removida] = criada.body.trilha.etapas;
    await request(app.getHttpServer())
      .post(`/progresso/${criada.body.id}/etapas/${mantida.id}/conclusao`)
      .set('Authorization', `Bearer ${tokenAluno}`)
      .expect(200);
    await request(app.getHttpServer())
      .post(`/progresso/${criada.body.id}/etapas/${removida.id}/conclusao`)
      .set('Authorization', `Bearer ${tokenAluno}`)
      .expect(200);
    fake.revisao = {
      titulo: criada.body.trilha.titulo,
      descricao: criada.body.trilha.descricao,
      etapas: [
        { id: mantida.id, titulo: mantida.titulo, conteudo: mantida.conteudo, ordem: 1 },
        {
          id: criada.body.trilha.etapas[2].id,
          titulo: criada.body.trilha.etapas[2].titulo,
          conteudo: criada.body.trilha.etapas[2].conteudo,
          ordem: 2
        }
      ]
    };
    const revista = await request(app.getHttpServer())
      .post(`/solicitacoes-trilha/${criada.body.id}`)
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ textoObjetivo: 'Remova a segunda etapa.' })
      .expect(201);
    expect(revista.body.totalEtapas).toBe(2);
    expect(revista.body.etapasConcluidas).toBe(1);
    expect(revista.body.trilha.etapas.map((e: { id: string }) => e.id)).not.toContain(removida.id);
    expect(revista.body.trilha.etapas.find((e: { id: string }) => e.id === mantida.id).concluida).toBe(true);
    expect(revista.body.percentualProgresso).toBe(0.5);
  });

  it('AC-010-03 timeout ou JSON inválido mantêm a trilha anterior', async () => {
    await interruptor(true);
    const criada = await request(app.getHttpServer())
      .post('/solicitacoes-trilha')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ textoObjetivo: 'Trilha que não deve mudar se o agente falhar.' })
      .expect(201);
    const titulos = criada.body.trilha.etapas.map((e: { titulo: string }) => e.titulo);
    fake.modo = 'timeout';
    const timeout = await request(app.getHttpServer())
      .post(`/solicitacoes-trilha/${criada.body.id}`)
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ textoObjetivo: 'Mude tudo.' })
      .expect(504);
    expect(timeout.body.codigo).toBe('timeout');
    fake.modo = 'sem_etapas';
    const invalido = await request(app.getHttpServer())
      .post(`/solicitacoes-trilha/${criada.body.id}`)
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ textoObjetivo: 'JSON incompleto.' })
      .expect(422);
    expect(invalido.body.codigo).toBe('json_invalido');
    const detalhe = await request(app.getHttpServer())
      .get(`/progresso/${criada.body.id}`)
      .set('Authorization', `Bearer ${tokenAluno}`)
      .expect(200);
    expect(detalhe.body.trilha.etapas.map((e: { titulo: string }) => e.titulo)).toEqual(titulos);
    const solicitacao = await dados.getRepository(SolicitacaoTrilha).findOneByOrFail({
      trilhaId: criada.body.trilha.id
    });
    expect(solicitacao.textoObjetivo).toContain('não deve mudar');
  });

  it('AC-010-04 pré-definida, outro aluno e admin não ajustam', async () => {
    await interruptor(true);
    const trilhaPre = await publicarPredefinida();
    const escolhida = await request(app.getHttpServer())
      .post('/progresso/escolher-trilha')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ trilhaId: trilhaPre })
      .expect(201);
    const pre = await request(app.getHttpServer())
      .post(`/solicitacoes-trilha/${escolhida.body.id}`)
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ textoObjetivo: 'Alterar catálogo.' })
      .expect(409);
    expect(pre.body.codigo).toBe('recusado');

    const personalizada = await request(app.getHttpServer())
      .post('/solicitacoes-trilha')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ textoObjetivo: 'Trilha só do Lucas.' })
      .expect(201);
    await request(app.getHttpServer())
      .post('/auth/cadastro')
      .send({ nome: 'Ana Lima', email: 'ana.ajuste@exemplo.com', senha: 'secreta123' })
      .expect(201);
    const ana = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ana.ajuste@exemplo.com', senha: 'secreta123' })
      .expect(200);
    const alheia = await request(app.getHttpServer())
      .post(`/solicitacoes-trilha/${personalizada.body.id}`)
      .set('Authorization', `Bearer ${ana.body.accessToken}`)
      .send({ textoObjetivo: 'Quero a trilha do Lucas.' })
      .expect(403);
    expect(alheia.body.codigo).toBe('recusado');
    await request(app.getHttpServer())
      .post(`/solicitacoes-trilha/${personalizada.body.id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ textoObjetivo: 'Admin ajusta.' })
      .expect(403);
    await request(app.getHttpServer())
      .post(`/solicitacoes-trilha/${personalizada.body.id}`)
      .send({ textoObjetivo: 'Anônimo ajusta.' })
      .expect(401);
  });

  it('progresso da trilha personalizada é do aluno (RB09)', async () => {
    await interruptor(true);
    const { body } = await request(app.getHttpServer())
      .post('/solicitacoes-trilha')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ textoObjetivo: 'Associar ao aluno que solicitou.' })
      .expect(201);
    const progresso = await dados.getRepository(Progresso).findOneByOrFail({ id: body.id });
    expect(progresso.alunoId).toBeDefined();
    expect(progresso.trilhaId).toBe(body.trilha.id);
  });
});

function listarArquivos(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const saida: string[] = [];
  for (const nome of readdirSync(dir)) {
    if (nome === 'node_modules' || nome === '.next') continue;
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) {
      saida.push(...listarArquivos(caminho));
    } else if (/\.(ts|tsx|js|jsx|mjs|cjs|json|env)$/.test(nome)) {
      saida.push(caminho);
    }
  }
  return saida;
}
