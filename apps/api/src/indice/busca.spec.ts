import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import { AuditLogger } from '../audit/audit.logger';
import { AuthService } from '../auth/auth.service';
import { CatalogoService } from '../catalogo/catalogo.service';
import { Categoria } from '../catalogo/categoria.entity';
import { Etapa } from '../catalogo/etapa.entity';
import { Trilha } from '../catalogo/trilha.entity';
import { ConfiguracaoLlmService } from '../config/configuracao-llm.service';
import { migrarAutoria } from '../db/migrar-autor';
import { FakeLlmAdapter } from '../llm/fake.adapter';
import { PORTA_LLM } from '../llm/porta-llm';
import { SolicitacaoTrilha } from '../llm/solicitacao-trilha.entity';
import { ConclusaoEtapa } from '../progresso/conclusao-etapa.entity';
import { Progresso } from '../progresso/progresso.entity';
import { Usuario } from '../usuario/usuario.entity';
import { FakeIndiceAdapter } from './fake.adapter';
import { PORTA_INDICE } from './porta-indice';

describe('SPEC-011 busca e trilha disponibilizada', () => {
  jest.setTimeout(60000);
  let app: INestApplication;
  let dados: DataSource;
  let audit: AuditLogger;
  let fakeLlm: FakeLlmAdapter;
  let fakeIndice: FakeIndiceAdapter;
  let tokenAdmin = '';
  let tokenAutor = '';
  let tokenOutro = '';
  let tokenTerceiro = '';
  let autorId = '';

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = modulo.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    await modulo.get(AuthService).seedAdministrador();
    await modulo.get(CatalogoService).seedPersonalizada();
    await modulo.get(ConfiguracaoLlmService).seed();
    dados = modulo.get(DataSource);
    audit = modulo.get(AuditLogger);
    fakeLlm = modulo.get(PORTA_LLM);
    fakeIndice = modulo.get(PORTA_INDICE);

    const admin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'mariana@estudaai.local', senha: 'AdminTemp1' })
      .expect(200);
    tokenAdmin = admin.body.accessToken;

    tokenAutor = await entrar('Ana Autora', 'ana.autor@exemplo.com');
    tokenOutro = await entrar('Bruno Leitor', 'bruno.leitor@exemplo.com');
    tokenTerceiro = await entrar('Clara Terceira', 'clara.terceira@exemplo.com');
    const autora = await dados.getRepository(Usuario).findOneByOrFail({ email: 'ana.autor@exemplo.com' });
    autorId = autora.id;

    await request(app.getHttpServer())
      .post('/configuracao/llm')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ habilitado: true })
      .expect(204);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  beforeEach(() => {
    fakeLlm.reset();
    fakeIndice.falhar = false;
    audit.linhas.length = 0;
  });

  it('nasce privada, com autor, e o catálogo público não a lista', async () => {
    const criada = await gerar(tokenAutor, 'Juros simples e compostos');
    const trilha = await dados.getRepository(Trilha).findOneByOrFail({ id: criada.trilha.id });
    expect(trilha.autorId).toBe(autorId);
    expect(trilha.disponivel).toBe(false);
    const catalogo = await request(app.getHttpServer()).get('/catalogo').expect(200);
    const titulos = catalogo.body.categorias.flatMap((c: { trilhas: { titulo: string }[] }) =>
      c.trilhas.map((t) => t.titulo)
    );
    expect(titulos).not.toContain('Juros simples e compostos');
  });

  it('disponibilizar não duplica trilha nem progresso e publica na categoria Personalizada', async () => {
    const antesTrilhas = await dados.getRepository(Trilha).count();
    const antesEtapas = await dados.getRepository(Etapa).count();
    const autora = await dados.getRepository(Usuario).findOneByOrFail({ email: 'ana.autor@exemplo.com' });
    const progressoAutor = await dados.getRepository(Progresso).findOneByOrFail({ alunoId: autora.id });
    const antesProgresso = await dados.getRepository(Progresso).count({ where: { alunoId: autora.id } });

    const resposta = await request(app.getHttpServer())
      .patch(`/solicitacoes-trilha/trilha/${progressoAutor.trilhaId}/disponibilidade`)
      .set('Authorization', `Bearer ${tokenAutor}`)
      .send({ disponivel: true })
      .expect(200);

    expect(resposta.body.id).toBe(progressoAutor.id);
    expect(await dados.getRepository(Trilha).count()).toBe(antesTrilhas);
    expect(await dados.getRepository(Etapa).count()).toBe(antesEtapas);
    expect(await dados.getRepository(Progresso).count({ where: { alunoId: autora.id } })).toBe(antesProgresso);

    const catalogo = await request(app.getHttpServer()).get('/catalogo').expect(200);
    const personalizada = catalogo.body.categorias.find((c: { nome: string }) => c.nome === 'Personalizada');
    expect(personalizada.trilhas.map((t: { titulo: string }) => t.titulo)).toContain('Juros simples e compostos');
    expect(personalizada.trilhas[0].autorNome).toBe('Ana Autora');
  });

  it('outro aluno começa a mesma trilha e as conclusões não se misturam', async () => {
    const trilha = await dados.getRepository(Trilha).findOneByOrFail({ titulo: 'Juros simples e compostos' });
    const etapa = await dados.getRepository(Etapa).findOneOrFail({ where: { trilha: { id: trilha.id } } });
    const autora = await dados.getRepository(Usuario).findOneByOrFail({ email: 'ana.autor@exemplo.com' });
    const progressoAutor = await dados.getRepository(Progresso).findOneByOrFail({ alunoId: autora.id, trilhaId: trilha.id });
    await request(app.getHttpServer())
      .post(`/progresso/${progressoAutor.id}/etapas/${etapa.id}/conclusao`)
      .set('Authorization', `Bearer ${tokenAutor}`)
      .expect(200);

    const iniciado = await request(app.getHttpServer())
      .post('/progresso/escolher-trilha')
      .set('Authorization', `Bearer ${tokenOutro}`)
      .send({ trilhaId: trilha.id })
      .expect(201);

    expect(iniciado.body.trilha.id).toBe(trilha.id);
    expect(iniciado.body.id).not.toBe(progressoAutor.id);
    expect(iniciado.body.etapasConcluidas).toBe(0);
    expect(iniciado.body.trilha.etapas[0].concluida).toBe(false);
    const conclusoesAutor = await dados.getRepository(ConclusaoEtapa).count({ where: { progressoId: progressoAutor.id } });
    expect(conclusoesAutor).toBe(1);
  });

  it('a busca acha a trilha disponível e esconde a personalizada privada de outro', async () => {
    await gerar(tokenTerceiro, 'Segredo privado da Clara');
    const visivel = await request(app.getHttpServer())
      .post('/busca')
      .set('Authorization', `Bearer ${tokenOutro}`)
      .send({ texto: 'juros compostos' })
      .expect(200);
    expect(visivel.body.resultados.length).toBeGreaterThan(0);
    expect(visivel.body.resultados.length).toBeLessThanOrEqual(5);
    expect(visivel.body.resultados[0].tituloTrilha).toBe('Juros simples e compostos');
    expect(visivel.body.resultados[0].autorNome).toBe('Ana Autora');
    expect(visivel.body.resultados[0].trecho.toLowerCase()).toContain('juros simples e compostos');

    const privada = await request(app.getHttpServer())
      .post('/busca')
      .set('Authorization', `Bearer ${tokenOutro}`)
      .send({ texto: 'segredo privado da clara' })
      .expect(200);
    expect(privada.body.resultados).toEqual([]);

    const daAutora = await request(app.getHttpServer())
      .post('/busca')
      .set('Authorization', `Bearer ${tokenTerceiro}`)
      .send({ texto: 'segredo privado da clara' })
      .expect(200);
    expect(daAutora.body.resultados[0].tituloTrilha).toBe('Segredo privado da Clara');
  });

  it('não grava revisão que omite etapa quando outro aluno já acompanha', async () => {
    const trilha = await dados.getRepository(Trilha).findOneByOrFail({ titulo: 'Juros simples e compostos' });
    const etapasAntes = await dados.getRepository(Etapa).find({ where: { trilha: { id: trilha.id } } });
    const autora = await dados.getRepository(Usuario).findOneByOrFail({ email: 'ana.autor@exemplo.com' });
    const progressoAutor = await dados.getRepository(Progresso).findOneByOrFail({ alunoId: autora.id, trilhaId: trilha.id });
    fakeLlm.revisao = {
      titulo: trilha.titulo,
      descricao: trilha.descricao,
      etapas: [{ titulo: 'Etapa substituta', conteudo: 'Sem a etapa anterior.', ordem: 1 }]
    };
    await request(app.getHttpServer())
      .post(`/solicitacoes-trilha/${progressoAutor.id}`)
      .set('Authorization', `Bearer ${tokenAutor}`)
      .send({ textoObjetivo: 'remova a etapa de montante' })
      .expect(409);
    const etapasDepois = await dados.getRepository(Etapa).find({ where: { trilha: { id: trilha.id } } });
    expect(etapasDepois.map((e) => e.id).sort()).toEqual(etapasAntes.map((e) => e.id).sort());
  });

  it('retirar a disponibilidade mantém quem já começou e recusa um aluno novo', async () => {
    const trilha = await dados.getRepository(Trilha).findOneByOrFail({ titulo: 'Juros simples e compostos' });
    const autora = await dados.getRepository(Usuario).findOneByOrFail({ email: 'ana.autor@exemplo.com' });
    const progressoAutor = await dados.getRepository(Progresso).findOneByOrFail({ alunoId: autora.id, trilhaId: trilha.id });
    const bruno = await dados.getRepository(Usuario).findOneByOrFail({ email: 'bruno.leitor@exemplo.com' });
    const progressoBruno = await dados.getRepository(Progresso).findOneByOrFail({ alunoId: bruno.id, trilhaId: trilha.id });

    await request(app.getHttpServer())
      .patch(`/solicitacoes-trilha/trilha/${trilha.id}/disponibilidade`)
      .set('Authorization', `Bearer ${tokenAutor}`)
      .send({ disponivel: false })
      .expect(200);

    await request(app.getHttpServer())
      .get(`/progresso/${progressoBruno.id}`)
      .set('Authorization', `Bearer ${tokenOutro}`)
      .expect(200);

    await request(app.getHttpServer())
      .post('/progresso/escolher-trilha')
      .set('Authorization', `Bearer ${tokenTerceiro}`)
      .send({ trilhaId: trilha.id })
      .expect(404);

    const busca = await request(app.getHttpServer())
      .post('/busca')
      .set('Authorization', `Bearer ${tokenTerceiro}`)
      .send({ texto: 'juros compostos' })
      .expect(200);
    expect(busca.body.resultados.find((r: { trilhaId: string }) => r.trilhaId === trilha.id)).toBeUndefined();

    await request(app.getHttpServer())
      .get(`/progresso/${progressoAutor.id}`)
      .set('Authorization', `Bearer ${tokenAutor}`)
      .expect(200);
  });

  it('falha do índice não desfaz a trilha e a busca avisa indisponível', async () => {
    const trilha = await dados.getRepository(Trilha).findOneByOrFail({ titulo: 'Juros simples e compostos' });
    fakeIndice.falhar = true;
    await request(app.getHttpServer())
      .patch(`/solicitacoes-trilha/trilha/${trilha.id}/disponibilidade`)
      .set('Authorization', `Bearer ${tokenAutor}`)
      .send({ disponivel: true })
      .expect(200);
    const salva = await dados.getRepository(Trilha).findOneByOrFail({ id: trilha.id });
    expect(salva.disponivel).toBe(true);

    const busca = await request(app.getHttpServer())
      .post('/busca')
      .set('Authorization', `Bearer ${tokenOutro}`)
      .send({ texto: 'juros compostos' })
      .expect(503);
    expect(busca.body.codigo).toBe('busca_indisponivel');
    expect(await dados.getRepository(Trilha).count()).toBeGreaterThan(0);
  });

  it('recusa busca de admin e anônimo, e disponibilidade de quem não é o autor', async () => {
    const trilha = await dados.getRepository(Trilha).findOneByOrFail({ titulo: 'Juros simples e compostos' });
    await request(app.getHttpServer()).post('/busca').send({ texto: 'juros' }).expect(401);
    await request(app.getHttpServer())
      .post('/busca')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ texto: 'juros' })
      .expect(403);
    await request(app.getHttpServer())
      .patch(`/solicitacoes-trilha/trilha/${trilha.id}/disponibilidade`)
      .set('Authorization', `Bearer ${tokenOutro}`)
      .send({ disponivel: false })
      .expect(403);
  });

  it('migração deixa indisponível a personalizada antiga sem autor', async () => {
    const categoria = await dados.getRepository(Categoria).findOneByOrFail({ nome: 'Personalizada' });
    const antiga = await dados.getRepository(Trilha).save(
      dados.getRepository(Trilha).create({
        titulo: 'Antiga sem gesto',
        descricao: 'Gerada antes da autoria.',
        tipo: 'personalizada',
        disponivel: true,
        autorId: null,
        categoria
      })
    );
    const aluno = await dados.getRepository(Usuario).findOneByOrFail({ id: autorId });
    await dados.getRepository(SolicitacaoTrilha).save(
      dados.getRepository(SolicitacaoTrilha).create({
        textoObjetivo: 'objetivo antigo',
        respostaLLM: '{}',
        aluno,
        alunoId: autorId,
        trilha: antiga,
        trilhaId: antiga.id
      })
    );
    await migrarAutoria(dados);
    const migrada = await dados.getRepository(Trilha).findOneByOrFail({ id: antiga.id });
    expect(migrada.autorId).toBe(autorId);
    expect(migrada.disponivel).toBe(false);
  });

  it('log e frontend não carregam a chave nem o texto indexado', async () => {
    fakeIndice.falhar = false;
    await request(app.getHttpServer())
      .post('/busca')
      .set('Authorization', `Bearer ${tokenOutro}`)
      .send({ texto: 'juros compostos' })
      .expect(200);
    const serial = JSON.stringify(audit.linhas);
    expect(serial).not.toContain('PINECONE_API_KEY');
    expect(serial).not.toContain('pcsk_');
    expect(serial.toLowerCase()).not.toContain('o montante no regime');
    const web = juntarFontes(join(__dirname, '..', '..', '..', '..', 'apps', 'web'));
    expect(web).not.toContain('PINECONE_API_KEY');
  });

  async function entrar(nome: string, email: string) {
    await request(app.getHttpServer()).post('/auth/cadastro').send({ nome, email, senha: 'secreta123' }).expect(201);
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, senha: 'secreta123' })
      .expect(200);
    return login.body.accessToken as string;
  }

  async function gerar(token: string, titulo: string) {
    fakeLlm.resposta = {
      titulo,
      descricao: `Percurso sobre ${titulo}.`,
      etapas: [
        {
          titulo: 'Montante',
          conteudo: `O montante no regime de ${titulo.toLowerCase()} usa a fórmula do período.`,
          ordem: 1
        }
      ]
    };
    const resposta = await request(app.getHttpServer())
      .post('/solicitacoes-trilha')
      .set('Authorization', `Bearer ${token}`)
      .send({ textoObjetivo: titulo })
      .expect(201);
    return resposta.body as { id: string; trilha: { id: string } };
  }
});

function juntarFontes(dir: string): string {
  let texto = '';
  for (const nome of readdirSync(dir)) {
    if (nome === 'node_modules' || nome === '.next') continue;
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) texto += juntarFontes(caminho);
    else if (nome.endsWith('.ts') || nome.endsWith('.tsx')) texto += readFileSync(caminho, 'utf8');
  }
  return texto;
}
