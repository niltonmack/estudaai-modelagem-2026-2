import { Injectable } from '@nestjs/common';
import { Pinecone } from '@pinecone-database/pinecone';
import { AcertoIndice, IndiceIndisponivelError, PortaIndice, RegistroIndice } from './porta-indice';

const NAMESPACE = '__default__';

@Injectable()
export class PineconeIndiceAdapter extends PortaIndice {
  private cliente: Pinecone | null = null;

  configurado(): boolean {
    return Boolean(process.env.PINECONE_API_KEY);
  }

  async gravar(registros: RegistroIndice[]): Promise<void> {
    if (!registros.length) return;
    const ns = this.namespace();
    await ns.upsertRecords({ records: registros });
  }

  async remover(ids: string[]): Promise<void> {
    if (!ids.length) return;
    const ns = this.namespace();
    for (const id of ids) {
      await ns.deleteOne({ id });
    }
  }

  async buscar(texto: string, autorId: string): Promise<AcertoIndice[]> {
    const ns = this.namespace();
    const resposta = await ns.searchRecords({
      query: {
        topK: 5,
        inputs: { text: texto },
        filter: {
          $or: [{ disponivel: { $eq: 'sim' } }, { autor: { $eq: autorId } }]
        }
      },
      fields: ['trilha', 'aula', 'titulo', 'autor']
    });
    const hits = resposta.result?.hits ?? [];
    return hits.map((hit) => {
      const fields = (hit.fields ?? {}) as Record<string, string>;
      const id = hit._id ?? '';
      return {
        id,
        trilha: fields.trilha ?? id.split('#')[0] ?? '',
        aula: fields.aula ?? id.split('#')[1] ?? '',
        titulo: fields.titulo ?? '',
        autor: fields.autor ?? ''
      };
    });
  }

  private namespace() {
    const chave = process.env.PINECONE_API_KEY;
    if (!chave) throw new IndiceIndisponivelError();
    if (!this.cliente) this.cliente = new Pinecone({ apiKey: chave });
    const nome = process.env.PINECONE_INDEX || 'estudaai-trilhas';
    return this.cliente.index({ name: nome }).namespace(NAMESPACE);
  }
}
