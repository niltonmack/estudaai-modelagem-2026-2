import { IsString, MinLength } from 'class-validator';
import { OrigemMensagem } from './mensagem.entity';

export class GerarTrilhaPersonalizadaDto {
  @IsString()
  @MinLength(1)
  textoObjetivo!: string;
}

export class EnviarMensagemDto {
  @IsString()
  @MinLength(1)
  texto!: string;
}

export type MensagemResposta = {
  id: string;
  texto: string;
  origem: OrigemMensagem;
  dataEnvio: string;
  trilhaId: string;
};

export type ConversaResposta = {
  progressoId: string;
  ativo: boolean;
  llmHabilitado: boolean;
  trilha: {
    id: string;
    titulo: string;
    descricao: string;
    tipo: 'pré-definida' | 'personalizada';
    categoria: { id: string; nome: string };
  };
  mensagens: MensagemResposta[];
};
