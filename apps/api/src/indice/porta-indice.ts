export const PORTA_INDICE = Symbol('PORTA_INDICE');

export type RegistroIndice = {
  id: string;
  text: string;
  trilha: string;
  aula: string;
  titulo: string;
  autor: string;
  disponivel: 'sim' | 'nao';
};

export type AcertoIndice = {
  id: string;
  trilha: string;
  aula: string;
  titulo: string;
  autor: string;
};

export class IndiceIndisponivelError extends Error {
  constructor() {
    super('Índice indisponível');
    this.name = 'IndiceIndisponivelError';
  }
}

export abstract class PortaIndice {
  abstract configurado(): boolean;
  abstract gravar(registros: RegistroIndice[]): Promise<void>;
  abstract remover(ids: string[]): Promise<void>;
  abstract buscar(texto: string, autorId: string): Promise<AcertoIndice[]>;
}
