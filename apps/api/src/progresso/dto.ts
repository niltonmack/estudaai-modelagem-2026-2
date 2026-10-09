import { IsUUID } from 'class-validator';

export class EscolherTrilhaDto {
  @IsUUID()
  trilhaId!: string;
}

export type EtapaProgressoResposta = {
  id: string;
  titulo: string;
  conteudo: string;
  ordem: number;
  concluida: boolean;
  dataConclusao: string | null;
};

export type HistoricoResposta = {
  etapaId: string;
  titulo: string;
  dataConclusao: string;
};

export type ProgressoResposta = {
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
    tipo: 'pré-definida' | 'personalizada';
    categoria: { id: string; nome: string };
    etapas: EtapaProgressoResposta[];
  };
  historico: HistoricoResposta[];
  proximaEtapa: { id: string; titulo: string; ordem: number } | null;
};

export type ProgressoListaResposta = {
  id: string;
  dataInicio: string;
  ativo: boolean;
  percentualProgresso: number;
  etapasConcluidas: number;
  totalEtapas: number;
  trilha: {
    id: string;
    titulo: string;
    tipo: 'pré-definida' | 'personalizada';
    categoria: { id: string; nome: string };
  };
  proximaEtapa: { id: string; titulo: string; ordem: number } | null;
};

export type AcompanhamentoProgressoResumo = {
  id: string;
  dataInicio: string;
  ativo: boolean;
  percentualProgresso: number;
  etapasConcluidas: number;
  totalEtapas: number;
  trilha: {
    id: string;
    titulo: string;
    tipo: 'pré-definida' | 'personalizada';
    categoria: { id: string; nome: string };
  };
  proximaEtapa: { id: string; titulo: string; ordem: number } | null;
};

export type AcompanhamentoListaItem = {
  id: string;
  nome: string;
  email: string;
  quantidadeProgressos: number;
  progressos: AcompanhamentoProgressoResumo[];
};

export type AcompanhamentoAlunoResposta = {
  id: string;
  nome: string;
  email: string;
  progressos: AcompanhamentoProgressoResumo[];
};

export type CatalogoPublicoResposta = {
  llmHabilitado: boolean;
  indisponivel: boolean;
  categorias: {
    id: string;
    nome: string;
    trilhas: {
      id: string;
      titulo: string;
      descricao: string;
      quantidadeEtapas: number;
    }[];
  }[];
};
