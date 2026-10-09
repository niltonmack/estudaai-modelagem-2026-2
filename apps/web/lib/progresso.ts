export type TrilhaCatalogo = {
  id: string;
  titulo: string;
  descricao: string;
  quantidadeEtapas: number;
  autorNome: string | null;
};

export type ResultadoBusca = {
  trilhaId: string;
  etapaId: string;
  tituloTrilha: string;
  tituloEtapa: string;
  tipo: "pré-definida" | "personalizada";
  autorNome: string | null;
  progressoId: string | null;
  trecho: string;
};

export type CategoriaCatalogo = {
  id: string;
  nome: string;
  trilhas: TrilhaCatalogo[];
};

export type CatalogoPublico = {
  llmHabilitado: boolean;
  indisponivel: boolean;
  categorias: CategoriaCatalogo[];
};

export type EtapaProgresso = {
  id: string;
  titulo: string;
  conteudo: string;
  ordem: number;
  concluida: boolean;
  dataConclusao: string | null;
};

export type ProgressoDetalhe = {
  id: string;
  dataInicio: string;
  ativo: boolean;
  percentualProgresso: number;
  etapasConcluidas: number;
  totalEtapas: number;
  retomado?: boolean;
  trilha: {
    id: string;
    titulo: string;
    descricao: string;
    tipo: "pré-definida" | "personalizada";
    disponivel: boolean;
    autorNome: string | null;
    souAutor: boolean;
    categoria: { id: string; nome: string };
    etapas: EtapaProgresso[];
  };
  historico: { etapaId: string; titulo: string; dataConclusao: string }[];
  proximaEtapa: { id: string; titulo: string; ordem: number } | null;
};

export type ProgressoLista = {
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

export type MensagemConversa = {
  id: string;
  texto: string;
  origem: "aluno" | "agente LLM";
  dataEnvio: string;
  trilhaId: string;
};

export type ConversaDetalhe = {
  progressoId: string;
  ativo: boolean;
  llmHabilitado: boolean;
  trilha: {
    id: string;
    titulo: string;
    descricao: string;
    tipo: "pré-definida" | "personalizada";
    categoria: { id: string; nome: string };
  };
  mensagens: MensagemConversa[];
};

export function destinoSeguro(next: string | null): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("://")) {
    return null;
  }
  return next;
}

export function dataPt(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}
