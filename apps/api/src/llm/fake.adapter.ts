import { ContextoConversa, LlmTimeoutError, PortaLlm } from './porta-llm';

export const RESPOSTA_LLM_VALIDA = {
  titulo: 'SQL para totais mensais',
  descricao: 'Percurso gerado para analisar planilhas de vendas com consultas SQL simples. Conteúdo em Markdown.',
  etapas: [
    {
      titulo: 'SELECT e filtros',
      conteudo: '## Consultas básicas\n\nLeia colunas e aplique `WHERE`.',
      ordem: 1
    },
    {
      titulo: 'Agrupar por mês',
      conteudo: '`GROUP BY` e totais.',
      ordem: 2
    },
    {
      titulo: 'Junções simples',
      conteudo: 'Relacionar vendas e produtos.',
      ordem: 3
    }
  ]
};

export type ModoFakeLlm =
  | 'ok'
  | 'timeout'
  | 'sem_etapas'
  | 'sem_titulo'
  | 'sem_descricao'
  | 'lento';

export class FakeLlmAdapter extends PortaLlm {
  modo: ModoFakeLlm = 'ok';
  resposta: unknown = RESPOSTA_LLM_VALIDA;
  atrasoMs = 0;

  reset() {
    this.modo = 'ok';
    this.resposta = RESPOSTA_LLM_VALIDA;
    this.atrasoMs = 0;
  }

  async conversar(_texto: string, contexto: ContextoConversa, signal?: AbortSignal): Promise<string> {
    if (this.modo === 'timeout') {
      throw new LlmTimeoutError();
    }
    if (this.atrasoMs > 0 || this.modo === 'lento') {
      await this.esperar(this.atrasoMs || 400, signal);
    }
    return `Nesta trilha «${contexto.titulo}», use o conteúdo das etapas já publicadas. Isso não altera o catálogo curado.`;
  }

  async gerarTrilha(_textoObjetivo: string, signal?: AbortSignal): Promise<unknown> {
    if (this.modo === 'timeout') {
      throw new LlmTimeoutError();
    }
    if (this.atrasoMs > 0 || this.modo === 'lento') {
      await this.esperar(this.atrasoMs || 400, signal);
    }
    if (this.modo === 'sem_etapas') {
      return { titulo: 'Incompleto', descricao: 'Sem etapas.', etapas: [] };
    }
    if (this.modo === 'sem_titulo') {
      return { descricao: 'Falta título.', etapas: RESPOSTA_LLM_VALIDA.etapas };
    }
    if (this.modo === 'sem_descricao') {
      return { titulo: 'Só título', etapas: RESPOSTA_LLM_VALIDA.etapas };
    }
    return this.resposta;
  }

  private esperar(ms: number, signal?: AbortSignal) {
    return new Promise<void>((resolver, recusar) => {
      const t = setTimeout(() => resolver(), ms);
      signal?.addEventListener('abort', () => {
        clearTimeout(t);
        recusar(new Error('abortado'));
      });
    });
  }
}
