export type Etapa = {
  id: string;
  titulo: string;
  conteudo: string;
  ordem: number;
};

export type ImpactoRemocao = {
  etapaId: string;
  etapaTitulo: string;
  progressosVigentes: number;
  conclusoesDestaEtapa: number;
  ultimaEtapa: boolean;
  alunos: {
    nome: string;
    etapasConcluidas: number;
    totalEtapas: number;
    percentualProgresso: number;
    concluiuEstaEtapa: boolean;
  }[];
};

export type Trilha = {
  id: string;
  titulo: string;
  descricao: string;
  tipo: "pré-definida";
  disponivel: boolean;
  quantidadeEtapas: number;
  categoria: { id: string; nome: string };
  etapas: Etapa[];
};
