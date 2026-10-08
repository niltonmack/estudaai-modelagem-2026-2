import { ProgressoDetalhe } from "./progresso";

export type Semana = { inicio: Date; rotulo: string; quantidade: number };

export type ResumoInicio = {
  feitas: number;
  total: number;
  percentual: number;
  emAndamento: number;
  finalizadas: number;
  semanas: Semana[];
  continuar: ProgressoDetalhe | null;
};

function inicioDaSemana(data: Date) {
  const d = new Date(data.getFullYear(), data.getMonth(), data.getDate());
  const deslocamento = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - deslocamento);
  return d;
}

function ultimaAtividade(detalhe: ProgressoDetalhe) {
  const datas = detalhe.historico.map((h) => new Date(h.dataConclusao).getTime());
  return Math.max(new Date(detalhe.dataInicio).getTime(), ...datas);
}

export function contarPorSemana(datas: string[], hoje = new Date(), quantidadeSemanas = 8): Semana[] {
  const atual = inicioDaSemana(hoje);
  const semanas: Semana[] = [];
  for (let i = quantidadeSemanas - 1; i >= 0; i -= 1) {
    const inicio = new Date(atual);
    inicio.setDate(atual.getDate() - i * 7);
    semanas.push({
      inicio,
      rotulo: inicio.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      quantidade: 0
    });
  }
  for (const data of datas) {
    const semana = inicioDaSemana(new Date(data)).getTime();
    const alvo = semanas.find((s) => s.inicio.getTime() === semana);
    if (alvo) alvo.quantidade += 1;
  }
  return semanas;
}

export function percentual(feitas: number, total: number) {
  return total ? Math.round((feitas / total) * 100) : 0;
}

export function resumirInicio(detalhes: ProgressoDetalhe[], hoje = new Date(), quantidadeSemanas = 8): ResumoInicio {
  const feitas = detalhes.reduce((soma, d) => soma + d.etapasConcluidas, 0);
  const total = detalhes.reduce((soma, d) => soma + d.totalEtapas, 0);
  const finalizadas = detalhes.filter((d) => d.totalEtapas > 0 && d.etapasConcluidas === d.totalEtapas).length;
  const semanas = contarPorSemana(
    detalhes.flatMap((d) => d.historico.map((h) => h.dataConclusao)),
    hoje,
    quantidadeSemanas
  );

  const pendentes = detalhes
    .filter((d) => d.proximaEtapa)
    .sort((a, b) => ultimaAtividade(b) - ultimaAtividade(a));

  return {
    feitas,
    total,
    percentual: percentual(feitas, total),
    emAndamento: detalhes.length - finalizadas,
    finalizadas,
    semanas,
    continuar: pendentes[0] ?? null
  };
}
