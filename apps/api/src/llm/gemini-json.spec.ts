import { extrairJsonLlm } from './gemini.adapter';
import { validarRespostaLlm } from './porta-llm';

function trilha(conteudo: string) {
  return JSON.stringify({
    titulo: 'SQL',
    descricao: 'Consultas de vendas',
    etapas: [{ titulo: 'Select', conteudo, ordem: 1 }]
  });
}

describe('extrairJsonLlm', () => {
  it('lê o JSON inteiro quando o Markdown da etapa tem cerca de código', () => {
    const extraido = extrairJsonLlm(trilha('Exemplo:\n```sql\nSELECT * FROM vendas;\n```'));
    expect(validarRespostaLlm(extraido)?.etapas[0].conteudo).toContain('SELECT * FROM vendas');
  });

  it('aceita o JSON embrulhado numa cerca markdown', () => {
    const extraido = extrairJsonLlm('```json\n' + trilha('texto da etapa') + '\n```');
    expect(validarRespostaLlm(extraido)?.titulo).toBe('SQL');
  });

  it('aceita cerca externa mesmo com cerca sql dentro do conteúdo', () => {
    const extraido = extrairJsonLlm('```json\n' + trilha('```sql\nSELECT 1;\n```') + '\n```');
    expect(validarRespostaLlm(extraido)?.etapas[0].conteudo).toContain('SELECT 1');
  });

  it('ignora texto antes do objeto', () => {
    const extraido = extrairJsonLlm('Segue o plano:\n' + trilha('texto da etapa'));
    expect(validarRespostaLlm(extraido)?.titulo).toBe('SQL');
  });
});
