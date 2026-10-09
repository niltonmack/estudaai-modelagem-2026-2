import { Injectable } from '@nestjs/common';
import { AcertoIndice, IndiceIndisponivelError, PortaIndice, RegistroIndice } from './porta-indice';

@Injectable()
export class FakeIndiceAdapter extends PortaIndice {
  falhar = false;
  private readonly registros = new Map<string, RegistroIndice>();

  reset() {
    this.falhar = false;
    this.registros.clear();
  }

  configurado(): boolean {
    return true;
  }

  async gravar(registros: RegistroIndice[]): Promise<void> {
    this.exigir();
    for (const registro of registros) {
      this.registros.set(registro.id, { ...registro });
    }
  }

  async remover(ids: string[]): Promise<void> {
    this.exigir();
    for (const id of ids) this.registros.delete(id);
  }

  async buscar(texto: string, autorId: string): Promise<AcertoIndice[]> {
    this.exigir();
    const consulta = texto.trim().toLocaleLowerCase('pt');
    const palavras = consulta.split(/\s+/).filter((p) => p.length > 2);
    const acertos: { registro: RegistroIndice; nota: number }[] = [];
    for (const registro of this.registros.values()) {
      if (registro.disponivel !== 'sim' && registro.autor !== autorId) continue;
      const corpo = `${registro.titulo}\n${registro.text}`.toLocaleLowerCase('pt');
      const nota = palavras.reduce((soma, palavra) => soma + (corpo.includes(palavra) ? 1 : 0), 0);
      if (nota > 0 || (consulta.length > 0 && corpo.includes(consulta))) {
        acertos.push({ registro, nota: nota || 1 });
      }
    }
    return acertos
      .sort((a, b) => b.nota - a.nota)
      .slice(0, 5)
      .map(({ registro }) => ({
        id: registro.id,
        trilha: registro.trilha,
        aula: registro.aula,
        titulo: registro.titulo,
        autor: registro.autor
      }));
  }

  private exigir() {
    if (this.falhar) throw new IndiceIndisponivelError();
  }
}
