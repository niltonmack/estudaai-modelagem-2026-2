import { ArrayMinSize, IsArray, IsString, IsUUID, MinLength } from 'class-validator';

export class CategoriaDto {
  @IsString()
  @MinLength(1)
  nome!: string;

  @IsString()
  @MinLength(1)
  descricao!: string;
}

export type CategoriaResposta = {
  id: string;
  nome: string;
  descricao: string;
  quantidadeTrilhas: number;
  sentinela: boolean;
};

export class TrilhaDto {
  @IsString()
  @MinLength(1)
  titulo!: string;

  @IsString()
  @MinLength(1)
  descricao!: string;

  @IsUUID()
  categoriaId!: string;
}

export class EtapaDto {
  @IsString()
  @MinLength(1)
  titulo!: string;

  @IsString()
  @MinLength(1)
  conteudo!: string;
}

export class ReordenarEtapasDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  ids!: string[];
}

export type EtapaResposta = {
  id: string;
  titulo: string;
  conteudo: string;
  ordem: number;
};

export type TrilhaResposta = {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'pré-definida';
  disponivel: boolean;
  quantidadeEtapas: number;
  categoria: { id: string; nome: string };
  etapas: EtapaResposta[];
};

export type ImpactoAluno = {
  nome: string;
  etapasConcluidas: number;
  totalEtapas: number;
  percentualProgresso: number;
  concluiuEstaEtapa: boolean;
};

export type ImpactoRemocao = {
  etapaId: string;
  etapaTitulo: string;
  progressosVigentes: number;
  conclusoesDestaEtapa: number;
  ultimaEtapa: boolean;
  alunos: ImpactoAluno[];
};
