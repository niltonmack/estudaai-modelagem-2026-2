import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import { AuditLogger } from '../audit/audit.logger';
import { AuthService } from '../auth/auth.service';
import { CatalogoService } from './catalogo.service';
import { Etapa } from './etapa.entity';
import { ConclusaoEtapa } from '../progresso/conclusao-etapa.entity';
import { Progresso } from '../progresso/progresso.entity';

describe('SPEC-005 impacto da remoção de etapa em uso', () => {
  jest.setTimeout(60000);
  let app: INestApplication;
  let audit: AuditLogger;
  let dados: DataSource;
  let tokenAdmin = '';
  let tokenAluno = '';
  let tokenAna = '';
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
      .send({ nome: 'Lucas Almeida', email: 'lucas.impacto@exemplo.com', senha: 'secreta123' })
      .expect(201);
    tokenAluno = (
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'lucas.impacto@exemplo.com', senha: 'secreta123' })
        .expect(200)
    ).body.accessToken;

    await request(app.getHttpServer())
      .post('/auth/cadastro')
      .send({ nome: 'Ana Souza', email: 'ana.impacto@exemplo.com', senha: 'secreta123' })
      .expect(201);
    tokenAna = (
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'ana.impacto@exemplo.com', senha: 'secreta123' })
        .expect(200)
    ).body.accessToken;

    categoriaId = (
      await request(app.getHttpServer())
        .post('/categorias')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ nome: 'Programação', descricao: 'Percursos de código e lógica.' })
        .expect(201)
    ).body.id;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  async function publicarComEtapas(titulo: string, nomes: string[]) {
    const { body: trilha } = await request(app.getHttpServer())
      .post('/trilhas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ titulo, descricao: 'Percurso curado.', categoriaId })
      .expect(201);
    for (const nome of nomes) {
      await request(app.getHttpServer())
        .post(`/trilhas/${trilha.id}/etapas`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ titulo: nome, conteudo: `## ${nome}` })
        .expect(201);
    }
    const publicada = await request(app.getHttpServer())
      .post(`/trilhas/${trilha.id}/publicar`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(201);
    return publicada.body as {
      id: string;
      etapas: { id: string; titulo: string }[];
    };
  }

  it('AC-005-01 e AC-005-02 recusa remoção com progresso; ConclusaoEtapa e percentual intactos', async () => {
    const trilha = await publicarComEtapas('Lógica de programação', [
      'Variáveis e tipos',
      'Condicionais',
      'Laços'
    ]);
    const progresso = (
      await request(app.getHttpServer())
        .post('/progresso/escolher-trilha')
        .set('Authorization', `Bearer ${tokenAluno}`)
        .send({ trilhaId: trilha.id })
        .expect(201)
    ).body;
    const etapa = trilha.etapas.find((e) => e.titulo === 'Condicionais')!;
    await request(app.getHttpServer())
      .post(`/progresso/${progresso.id}/etapas/${etapa.id}/conclusao`)
      .set('Authorization', `Bearer ${tokenAluno}`)
      .expect(200);

    const antesProgresso = await dados.getRepository(Progresso).count({ where: { trilhaId: trilha.id } });
    const antesConclusao = await dados.getRepository(ConclusaoEtapa).count({ where: { etapaId: etapa.id } });
    const percentualAntes = (
      await request(app.getHttpServer())
        .get(`/progresso/${progresso.id}`)
        .set('Authorization', `Bearer ${tokenAluno}`)
        .expect(200)
    ).body.percentualProgresso;

    const inicio = Date.now();
    const recusa = await request(app.getHttpServer())
      .delete(`/trilhas/${trilha.id}/etapas/${etapa.id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(409);
    expect(Date.now() - inicio).toBeLessThan(2000);
    expect(recusa.body.message).toMatch(/não é possível remover/i);
    expect(recusa.body.message).toContain('alunos acompanhando');
    expect(recusa.body.remocaoRecusada).toBe(true);
    expect(recusa.body.impacto.progressosVigentes).toBe(1);
    expect(recusa.body.impacto.conclusoesDestaEtapa).toBe(1);
    expect(recusa.body.impacto.alunos[0].nome).toBe('Lucas Almeida');
    expect(recusa.body.impacto.alunos[0].percentualProgresso).toBeCloseTo(percentualAntes);

    expect(await dados.getRepository(Etapa).count({ where: { id: etapa.id } })).toBe(1);
    expect(await dados.getRepository(Progresso).count({ where: { trilhaId: trilha.id } })).toBe(antesProgresso);
    expect(await dados.getRepository(ConclusaoEtapa).count({ where: { etapaId: etapa.id } })).toBe(antesConclusao);

    const depois = await request(app.getHttpServer())
      .get(`/progresso/${progresso.id}`)
      .set('Authorization', `Bearer ${tokenAluno}`)
      .expect(200);
    expect(depois.body.percentualProgresso).toBe(percentualAntes);
    expect(depois.body.etapasConcluidas).toBe(1);
    expect(depois.body.historico).toHaveLength(1);
    expect(JSON.stringify(audit.linhas.filter((l) => l.event === 'catalogo.etapa.remocao_recusada'))).not.toMatch(
      /eyJ/
    );
  });

  it('recusa com N alunos em progresso e preserva quem não concluiu a etapa', async () => {
    const trilha = await publicarComEtapas('Estruturas', ['Se', 'Senão', 'Laço']);
    const etapa = trilha.etapas[0];
    const lucas = (
      await request(app.getHttpServer())
        .post('/progresso/escolher-trilha')
        .set('Authorization', `Bearer ${tokenAluno}`)
        .send({ trilhaId: trilha.id })
        .expect(201)
    ).body;
    await request(app.getHttpServer())
      .post(`/progresso/${lucas.id}/etapas/${etapa.id}/conclusao`)
      .set('Authorization', `Bearer ${tokenAluno}`)
      .expect(200);

    await request(app.getHttpServer())
      .post('/progresso/escolher-trilha')
      .set('Authorization', `Bearer ${tokenAna}`)
      .send({ trilhaId: trilha.id })
      .expect(201);

    const recusa = await request(app.getHttpServer())
      .delete(`/trilhas/${trilha.id}/etapas/${etapa.id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(409);
    expect(recusa.body.impacto.progressosVigentes).toBe(2);
    expect(recusa.body.impacto.conclusoesDestaEtapa).toBe(1);
    const nomes = recusa.body.impacto.alunos.map((a: { nome: string }) => a.nome).sort();
    expect(nomes).toEqual(['Ana Souza', 'Lucas Almeida']);
    expect(await dados.getRepository(Etapa).count({ where: { id: etapa.id } })).toBe(1);
  });

  it('AC-005-03 recusa última etapa também por RB03 quando há progresso', async () => {
    const trilha = await publicarComEtapas('Condicionais', ['Se e senão']);
    const unica = trilha.etapas[0];
    await request(app.getHttpServer())
      .post('/progresso/escolher-trilha')
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({ trilhaId: trilha.id })
      .expect(201);
    const recusa = await request(app.getHttpServer())
      .delete(`/trilhas/${trilha.id}/etapas/${unica.id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(409);
    expect(recusa.body.message).toContain('alunos acompanhando');
    expect(recusa.body.message).toContain('sem etapas');
    expect(recusa.body.impacto.ultimaEtapa).toBe(true);
    expect(await dados.getRepository(Etapa).count({ where: { id: unica.id } })).toBe(1);
  });

  it('AC-005-04 remove etapa sem progresso quando há irmãs', async () => {
    const trilha = await publicarComEtapas('Sem alunos', ['A', 'B', 'C']);
    const meio = trilha.etapas[1];
    const ok = await request(app.getHttpServer())
      .delete(`/trilhas/${trilha.id}/etapas/${meio.id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(200);
    expect(ok.body.etapas).toHaveLength(2);
    expect(await dados.getRepository(Etapa).count({ where: { id: meio.id } })).toBe(0);
  });

  it('INV-005-05 aluno não remove etapa; recusa é da API', async () => {
    const trilha = await publicarComEtapas('Só admin', ['Uma', 'Duas']);
    const etapa = trilha.etapas[0];
    await request(app.getHttpServer())
      .delete(`/trilhas/${trilha.id}/etapas/${etapa.id}`)
      .set('Authorization', `Bearer ${tokenAluno}`)
      .expect(403);
    await request(app.getHttpServer()).delete(`/trilhas/${trilha.id}/etapas/${etapa.id}`).expect(401);
    expect(await dados.getRepository(Etapa).count({ where: { id: etapa.id } })).toBe(1);
  });
});
