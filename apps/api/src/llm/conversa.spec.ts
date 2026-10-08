import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import { AuditLogger } from '../audit/audit.logger';
import { AuthService } from '../auth/auth.service';
import { CatalogoService } from '../catalogo/catalogo.service';
import { Trilha } from '../catalogo/trilha.entity';
import { ConfiguracaoLlmService } from '../config/configuracao-llm.service';
import { Progresso } from '../progresso/progresso.entity';
import { FakeLlmAdapter } from './fake.adapter';
import { Mensagem } from './mensagem.entity';
import { PORTA_LLM } from './porta-llm';

describe('SPEC-007 conversa referida à trilha', () => {
  jest.setTimeout(60000);
  let app: INestApplication;
  let audit: AuditLogger;
  let dados: DataSource;
  let fake: FakeLlmAdapter;
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
    fake = modulo.get(PORTA_LLM) as FakeLlmAdapter;

    const admin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'mariana@estudaai.local', senha: 'AdminTemp1' })
      .expect(200);
    tokenAdmin = admin.body.accessToken;

    await request(app.getHttpServer())
      .post('/auth/cadastro')
      .send({ nome: 'Lucas Almeida', email: 'lucas.chat@exemplo.com', senha: 'secreta123' })
      .expect(201);
    const aluno = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'lucas.chat@exemplo.com', senha: 'secreta123' })
      .expect(200);
    tokenAluno = aluno.body.accessToken;

    await request(app.getHttpServer())
      .post('/auth/cadastro')
      .send({ nome: 'Ana Outra', email: 'ana.chat@exemplo.com', senha: 'secreta123' })
      .expect(201);
    const outro = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ana.chat@exemplo.com', senha: 'secreta123' })
      .expect(200);
    tokenOutro = outro.body.accessToken;
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

  async function progressoDoAluno() {
    await interruptor(true);
    const { body } = await request(app.getHttpServer())
      .post('/solicitacoes-trilha')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ textoObjetivo: 'Quero analisar planilhas de vendas com SQL.' })
      .expect(201);
    return body as { id: string; trilha: { id: string; titulo: string } };
  }

  async function publicarPredefinida() {
    if (!categoriaId) {
      const categoria = await request(app.getHttpServer())
        .post('/categorias')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ nome: 'Lógica', descricao: 'Percursos curados.' })
        .expect(201);
      categoriaId = categoria.body.id;
    }
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

  it('AC-007-01 round-trip com adaptador falso referido à mesma trilha', async () => {
    const progresso = await progressoDoAluno();
    const { body } = await request(app.getHttpServer())
      .post(`/progresso/${progresso.id}/mensagens`)
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ texto: 'No GROUP BY, o total por mês entra no SELECT ou só no agrupamento?' })
      .expect(201);
    expect(body.progressoId).toBe(progresso.id);
    expect(body.trilha.id).toBe(progresso.trilha.id);
    expect(body.mensagens).toHaveLength(2);
    expect(body.mensagens[0].origem).toBe('aluno');
    expect(body.mensagens[0].trilhaId).toBe(progresso.trilha.id);
    expect(body.mensagens[1].origem).toBe('agente LLM');
    expect(body.mensagens[1].trilhaId).toBe(progresso.trilha.id);
    expect(body.mensagens[1].texto).toMatch(/catálogo curado/);
    const gravadas = await dados.getRepository(Mensagem).find({ where: { trilhaId: progresso.trilha.id } });
    expect(gravadas.every((m) => Boolean(m.trilhaId))).toBe(true);
    expect(audit.linhas.some((l) => l.event === 'llm.conversa.ok')).toBe(true);
    const listagem = await request(app.getHttpServer())
      .get(`/progresso/${progresso.id}/mensagens`)
      .set('Authorization', `Bearer ${tokenAluno}`)
      .expect(200);
    expect(listagem.body.mensagens).toHaveLength(2);
  });

  it('AC-007-02 recusa sem progresso ativo; nenhuma Mensagem nova', async () => {
    await interruptor(true);
    const antes = await dados.getRepository(Mensagem).count();
    const recusa = await request(app.getHttpServer())
      .post('/progresso/00000000-0000-4000-8000-000000000000/mensagens')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ texto: 'Dúvida sem trilha.' })
      .expect(409);
    expect(recusa.body.codigo).toBe('sem_progresso');
    expect(await dados.getRepository(Mensagem).count()).toBe(antes);
  });

  it('INV-007-02 progresso inativo também recusa', async () => {
    const progresso = await progressoDoAluno();
    await dados.getRepository(Progresso).update({ id: progresso.id }, { ativo: false });
    const antes = await dados.getRepository(Mensagem).count();
    const recusa = await request(app.getHttpServer())
      .post(`/progresso/${progresso.id}/mensagens`)
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ texto: 'Depois de inativar.' })
      .expect(409);
    expect(recusa.body.codigo).toBe('sem_progresso');
    expect(await dados.getRepository(Mensagem).count()).toBe(antes);
  });

  it('AC-007-03 conversa bem-sucedida não altera pré-definidas (RB10)', async () => {
    await publicarPredefinida();
    const progresso = await progressoDoAluno();
    const snapshot = await dados.getRepository(Trilha).find({ where: { tipo: 'pré-definida' } });
    await request(app.getHttpServer())
      .post(`/progresso/${progresso.id}/mensagens`)
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ texto: 'Posso mudar a trilha curada?' })
      .expect(201);
    const depois = await dados.getRepository(Trilha).find({ where: { tipo: 'pré-definida' } });
    expect(depois.map((t) => `${t.id}:${t.titulo}:${t.descricao}`).sort()).toEqual(
      snapshot.map((t) => `${t.id}:${t.titulo}:${t.descricao}`).sort()
    );
  });

  it('AC-007-04 timeout 60 s: falha informada e catálogo intacto', async () => {
    const progresso = await progressoDoAluno();
    const etapasAntes = await dados.getRepository(Trilha).findOne({
      where: { id: progresso.trilha.id },
      relations: ['etapas']
    });
    const preAntes = await dados.getRepository(Trilha).count({ where: { tipo: 'pré-definida' } });
    fake.modo = 'timeout';
    const falha = await request(app.getHttpServer())
      .post(`/progresso/${progresso.id}/mensagens`)
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ texto: 'E a etapa 3 usa JOIN?' })
      .expect(504);
    expect(falha.body.codigo).toBe('timeout');
    expect(falha.body.message).toMatch(/a tempo/);
    expect(await dados.getRepository(Trilha).count({ where: { tipo: 'pré-definida' } })).toBe(preAntes);
    const etapasDepois = await dados.getRepository(Trilha).findOne({
      where: { id: progresso.trilha.id },
      relations: ['etapas']
    });
    expect(etapasDepois?.etapas).toHaveLength(etapasAntes?.etapas.length ?? 0);
    const agente = await dados.getRepository(Mensagem).count({
      where: { trilhaId: progresso.trilha.id, origem: 'agente LLM' }
    });
    expect(agente).toBe(0);
  });

  it('AC-007-05 LLM desligado recusa e não grava mensagem', async () => {
    const progresso = await progressoDoAluno();
    await interruptor(false);
    const antes = await dados.getRepository(Mensagem).count();
    const recusa = await request(app.getHttpServer())
      .post(`/progresso/${progresso.id}/mensagens`)
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ texto: 'Com o agente desligado.' })
      .expect(409);
    expect(recusa.body.codigo).toBe('llm_desligado');
    expect(await dados.getRepository(Mensagem).count()).toBe(antes);
  });

  it('AC-007-06 admin e anônimo são recusados', async () => {
    const progresso = await progressoDoAluno();
    const antes = await dados.getRepository(Mensagem).count();
    await request(app.getHttpServer())
      .post(`/progresso/${progresso.id}/mensagens`)
      .send({ texto: 'Anônimo' })
      .expect(401);
    await request(app.getHttpServer())
      .post(`/progresso/${progresso.id}/mensagens`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ texto: 'Admin' })
      .expect(403);
    expect(await dados.getRepository(Mensagem).count()).toBe(antes);
  });

  it('outro aluno não conversa no progresso alheio', async () => {
    const progresso = await progressoDoAluno();
    const antes = await dados.getRepository(Mensagem).count();
    const recusa = await request(app.getHttpServer())
      .post(`/progresso/${progresso.id}/mensagens`)
      .set('Authorization', `Bearer ${tokenOutro}`)
      .send({ texto: 'Progresso de outro.' })
      .expect(409);
    expect(recusa.body.codigo).toBe('sem_progresso');
    expect(await dados.getRepository(Mensagem).count()).toBe(antes);
  });

  it('INV-007-01 coluna trilha_id é obrigatória', () => {
    const col = dados.getMetadata(Mensagem).findColumnWithPropertyName('trilhaId');
    expect(col?.isNullable).toBe(false);
  });

  it('INV-007-06 chave Gemini não está no frontend Next.js', () => {
    const raiz = join(__dirname, '..', '..', '..', 'web');
    const proibidos = [/GEMINI_API_KEY/, /generativelanguage\.googleapis/, /AIza[0-9A-Za-z_-]{20,}/];
    for (const arquivo of listarArquivos(raiz)) {
      const texto = readFileSync(arquivo, 'utf8');
      for (const padrao of proibidos) {
        expect(texto).not.toMatch(padrao);
      }
    }
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
