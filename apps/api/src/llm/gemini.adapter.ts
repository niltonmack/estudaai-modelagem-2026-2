import { ContextoConversa, LlmTimeoutError, PortaLlm, TrilhaAtualLlm } from './porta-llm';

const MODELO_PADRAO = 'gemini-3.5-flash-lite';

export class GeminiLlmAdapter extends PortaLlm {
  constructor(
    private readonly chave = process.env.GEMINI_API_KEY ?? '',
    private readonly modelo = process.env.GEMINI_MODEL ?? MODELO_PADRAO
  ) {
    super();
  }

  async gerarTrilha(textoObjetivo: string, signal?: AbortSignal): Promise<unknown> {
    const texto = await this.chamar(this.promptTrilha(textoObjetivo), true, signal);
    return extrairJsonLlm(texto);
  }

  async revisarTrilha(textoObjetivo: string, atual: TrilhaAtualLlm, signal?: AbortSignal): Promise<unknown> {
    const texto = await this.chamar(this.promptRevisao(textoObjetivo, atual), true, signal);
    return extrairJsonLlm(texto);
  }

  async conversar(texto: string, contexto: ContextoConversa, signal?: AbortSignal): Promise<string> {
    const resposta = await this.chamar(this.promptConversa(texto, contexto), false, signal);
    const limpo = resposta.trim();
    if (!limpo) {
      throw new LlmTimeoutError();
    }
    return limpo;
  }

  private async chamar(prompt: string, json: boolean, signal?: AbortSignal): Promise<string> {
    if (!this.chave.trim()) {
      throw new LlmTimeoutError('O agente não respondeu em 60 segundos.');
    }
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.modelo)}:generateContent` +
      `?key=${encodeURIComponent(this.chave)}`;
    const corpo = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: json
        ? { temperature: 0.4, responseMimeType: 'application/json' }
        : { temperature: 0.4 }
    };
    let resposta: Response;
    try {
      resposta = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
        signal
      });
    } catch {
      throw new LlmTimeoutError();
    }
    if (!resposta.ok) {
      throw new LlmTimeoutError();
    }
    const jsonResposta = (await resposta.json()) as {
      candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[];
    };
    return textoUtil(jsonResposta.candidates?.[0]?.content?.parts);
  }

  private promptTrilha(objetivo: string) {
    return [
      'Você é o agente do EstudaAI.',
      'Dado o objetivo de estudo do aluno, devolva SOMENTE um JSON (sem markdown) no formato:',
      '{"titulo":"string","descricao":"string","etapas":[{"titulo":"string","conteudo":"string em Markdown","ordem":1}]}',
      'Regras: titulo e descricao obrigatórios; pelo menos uma etapa; conteudo em Markdown; não escolha categoria;',
      'textos em português do Brasil, adequados a material escolar.',
      'Objetivo do aluno:',
      objetivo
    ].join('\n');
  }

  private promptRevisao(objetivo: string, atual: TrilhaAtualLlm) {
    return [
      'Você é o agente do EstudaAI.',
      'O aluno quer corrigir ou melhorar a trilha personalizada já existente.',
      'Devolva SOMENTE um JSON (sem markdown) no formato:',
      '{"titulo":"string","descricao":"string","etapas":[{"id":"uuid da etapa que permanece, ou omita id se for etapa nova","titulo":"string","conteudo":"string em Markdown","ordem":1}]}',
      'Regras: devolva a trilha inteira; titulo e descricao obrigatórios; pelo menos uma etapa;',
      'para manter uma etapa, repita o id recebido; para excluir, omita essa etapa; para incluir, omita o id;',
      'não escolha categoria; não altere trilhas pré-definidas;',
      'textos em português do Brasil, adequados a material escolar.',
      'Trilha atual:',
      JSON.stringify({
        titulo: atual.titulo,
        descricao: atual.descricao,
        etapas: atual.etapas
      }),
      'Pedido do aluno:',
      objetivo
    ].join('\n');
  }

  private promptConversa(texto: string, contexto: ContextoConversa) {
    return [
      'Você é o agente do EstudaAI.',
      `O aluno está estudando a trilha «${contexto.titulo}».`,
      `Descrição da trilha: ${contexto.descricao}`,
      'Responda em português do Brasil, com apoio ao estudo desta trilha.',
      'Não crie, altere ou substitua trilhas pré-definidas.',
      'Pergunta do aluno:',
      texto
    ].join('\n');
  }
}

function textoUtil(partes: { text?: string; thought?: boolean }[] | undefined): string {
  const lista = partes ?? [];
  const visiveis = lista.filter((parte) => !parte.thought);
  const escolhidas = visiveis.length > 0 ? visiveis : lista;
  return escolhidas.map((parte) => parte.text ?? '').join('\n');
}

export function extrairJsonLlm(texto: string): unknown {
  const limpo = texto.trim();
  const direto = tentarParse(limpo);
  if (direto.ok) return direto.valor;

  const cerca = limpo.match(/^```(?:json)?\s*([\s\S]*?)```$/);
  if (cerca) {
    const interno = tentarParse(cerca[1].trim());
    if (interno.ok) return interno.valor;
  }

  const inicio = limpo.indexOf('{');
  const fim = limpo.lastIndexOf('}');
  if (inicio >= 0 && fim > inicio) {
    const recorte = tentarParse(limpo.slice(inicio, fim + 1));
    if (recorte.ok) return recorte.valor;
  }

  return limpo;
}

function tentarParse(texto: string): { ok: true; valor: unknown } | { ok: false } {
  try {
    return { ok: true, valor: JSON.parse(texto) };
  } catch {
    return { ok: false };
  }
}
