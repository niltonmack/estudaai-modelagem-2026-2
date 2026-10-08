export const PORTA_LLM = 'PORTA_LLM';
export const LLM_TIMEOUT_MS = 'LLM_TIMEOUT_MS';
export const TIMEOUT_LLM_PADRAO_MS = 60_000;

export type EtapaLlm = {
  titulo: string;
  conteudo: string;
  ordem: number;
};

export type RespostaLlm = {
  titulo: string;
  descricao: string;
  etapas: EtapaLlm[];
};

export class LlmTimeoutError extends Error {
  constructor(message = 'O agente não respondeu em 60 segundos.') {
    super(message);
    this.name = 'LlmTimeoutError';
  }
}

export type ContextoConversa = {
  titulo: string;
  descricao: string;
};

export abstract class PortaLlm {
  abstract gerarTrilha(textoObjetivo: string, signal?: AbortSignal): Promise<unknown>;
  abstract conversar(texto: string, contexto: ContextoConversa, signal?: AbortSignal): Promise<string>;
}

export function comTimeout<T>(promessa: Promise<T>, ms: number): Promise<T> {
  let temporizador: ReturnType<typeof setTimeout> | undefined;
  const estouro = new Promise<never>((_, recusar) => {
    temporizador = setTimeout(() => recusar(new LlmTimeoutError()), ms);
  });
  return Promise.race([promessa, estouro]).finally(() => {
    if (temporizador) clearTimeout(temporizador);
  });
}

export function validarRespostaLlm(bruto: unknown): RespostaLlm | null {
  if (!bruto || typeof bruto !== 'object') return null;
  const obj = bruto as Record<string, unknown>;
  const titulo = textoObrigatorio(obj.titulo);
  const descricao = textoObrigatorio(obj.descricao);
  if (!titulo || !descricao) return null;
  if (!Array.isArray(obj.etapas) || obj.etapas.length < 1) return null;
  const etapas: EtapaLlm[] = [];
  for (const item of obj.etapas) {
    if (!item || typeof item !== 'object') return null;
    const etapa = item as Record<string, unknown>;
    const etapaTitulo = textoObrigatorio(etapa.titulo);
    const conteudo = textoObrigatorio(etapa.conteudo);
    const ordem = Number(etapa.ordem);
    if (!etapaTitulo || !conteudo || !Number.isFinite(ordem)) return null;
    etapas.push({ titulo: etapaTitulo, conteudo, ordem });
  }
  if (etapas.length < 1) return null;
  return { titulo, descricao, etapas: etapas.sort((a, b) => a.ordem - b.ordem) };
}

function textoObrigatorio(valor: unknown): string | null {
  if (typeof valor !== 'string') return null;
  const limpo = valor.trim();
  return limpo ? limpo : null;
}
