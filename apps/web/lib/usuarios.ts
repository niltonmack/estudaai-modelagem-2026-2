export type UsuarioConta = {
  id: string;
  nome: string;
  email: string;
  perfil: "aluno" | "administrador";
  quantidadeProgressos: number;
  proprio: boolean;
};

export type AcompanhamentoProgresso = {
  id: string;
  dataInicio: string;
  ativo: boolean;
  percentualProgresso: number;
  etapasConcluidas: number;
  totalEtapas: number;
  trilha: {
    id: string;
    titulo: string;
    tipo: "pré-definida" | "personalizada";
    categoria: { id: string; nome: string };
  };
  proximaEtapa: { id: string; titulo: string; ordem: number } | null;
};

export type AcompanhamentoAluno = {
  id: string;
  nome: string;
  email: string;
  quantidadeProgressos?: number;
  progressos: AcompanhamentoProgresso[];
};

export type AcompanhamentoDetalhe = {
  id: string;
  percentualProgresso: number;
  etapasConcluidas: number;
  totalEtapas: number;
  trilha: {
    titulo: string;
    tipo: "pré-definida" | "personalizada";
    categoria: { id: string; nome: string };
    etapas: { id: string; titulo: string; ordem: number; concluida: boolean }[];
  };
  proximaEtapa: { id: string; titulo: string; ordem: number } | null;
};

export function percentualTexto(valor: number) {
  return `${Math.round(valor * 100)}%`;
}
