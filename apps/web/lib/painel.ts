import { contarPorSemana, percentual, Semana } from "./inicio";
import { Trilha } from "./trilha";
import { AcompanhamentoAluno, UsuarioConta } from "./usuarios";

export type TrilhaAcompanhada = {
  id: string;
  titulo: string;
  categoria: string;
  alunos: number;
  media: number;
};

export type ResumoPainel = {
  alunos: number;
  administradores: number;
  alunosComTrilha: number;
  trilhasAcompanhadas: number;
  acompanhamentos: number;
  emAndamento: number;
  trilhasPublicadas: number;
  trilhasPreDefinidas: number;
  feitas: number;
  total: number;
  percentual: number;
  semanas: Semana[];
  ranking: TrilhaAcompanhada[];
};

export function resumirPainel(
  andamento: AcompanhamentoAluno[],
  usuarios: UsuarioConta[],
  trilhas: Trilha[],
  hoje = new Date()
): ResumoPainel {
  const progressos = andamento.flatMap((a) => a.progressos);
  const feitas = progressos.reduce((soma, p) => soma + p.etapasConcluidas, 0);
  const total = progressos.reduce((soma, p) => soma + p.totalEtapas, 0);

  const porTrilha = new Map<string, { titulo: string; categoria: string; percentuais: number[] }>();
  for (const p of progressos) {
    const atual = porTrilha.get(p.trilha.id) ?? {
      titulo: p.trilha.titulo,
      categoria: p.trilha.categoria.nome,
      percentuais: []
    };
    atual.percentuais.push(percentual(p.etapasConcluidas, p.totalEtapas));
    porTrilha.set(p.trilha.id, atual);
  }
  const ranking = [...porTrilha.entries()]
    .map(([id, t]) => ({
      id,
      titulo: t.titulo,
      categoria: t.categoria,
      alunos: t.percentuais.length,
      media: Math.round(t.percentuais.reduce((s, v) => s + v, 0) / t.percentuais.length)
    }))
    .sort((a, b) => b.alunos - a.alunos || b.media - a.media)
    .slice(0, 5);

  return {
    alunos: usuarios.filter((u) => u.perfil === "aluno").length,
    administradores: usuarios.filter((u) => u.perfil === "administrador").length,
    alunosComTrilha: andamento.filter((a) => a.progressos.length > 0).length,
    trilhasAcompanhadas: porTrilha.size,
    acompanhamentos: progressos.length,
    emAndamento: progressos.filter((p) => p.proximaEtapa).length,
    trilhasPublicadas: trilhas.filter((t) => t.disponivel).length,
    trilhasPreDefinidas: trilhas.length,
    feitas,
    total,
    percentual: percentual(feitas, total),
    semanas: contarPorSemana(
      progressos.map((p) => p.dataInicio),
      hoje
    ),
    ranking
  };
}

export function plural(n: number, um: string, varios: string) {
  return `${n} ${n === 1 ? um : varios}`;
}
