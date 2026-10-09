import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogger } from '../audit/audit.logger';
import { Etapa } from '../catalogo/etapa.entity';
import { Trilha } from '../catalogo/trilha.entity';
import { PortaIndice, PORTA_INDICE, RegistroIndice } from './porta-indice';

@Injectable()
export class IndiceService implements OnModuleInit {
  constructor(
    @InjectRepository(Trilha) private readonly trilhas: Repository<Trilha>,
    @InjectRepository(Etapa) private readonly etapas: Repository<Etapa>,
    @Inject(PORTA_INDICE) private readonly porta: PortaIndice,
    private readonly audit: AuditLogger
  ) {}

  async onModuleInit() {
    if (!this.porta.configurado()) return;
    const trilhas = await this.trilhas.find({ select: ['id'] });
    for (const trilha of trilhas) {
      await this.sincronizar(trilha.id);
    }
  }

  async sincronizar(trilhaId: string, removidas: string[] = []): Promise<void> {
    if (!this.porta.configurado()) return;
    try {
      if (removidas.length) {
        const ids = removidas.map((etapaId) => `${trilhaId}#${etapaId}`);
        await this.porta.remover(ids);
        for (const id of ids) this.logRemovido(id);
      }
      const trilha = await this.trilhas.findOne({
        where: { id: trilhaId },
        relations: ['etapas']
      });
      if (!trilha) return;
      const etapas = trilha.etapas ?? [];
      const indexar = trilha.tipo === 'personalizada' || trilha.disponivel;
      if (!indexar) {
        const ids = etapas.map((etapa) => `${trilha.id}#${etapa.id}`);
        if (ids.length) {
          await this.porta.remover(ids);
          for (const id of ids) this.logRemovido(id);
        }
        return;
      }
      const registros: RegistroIndice[] = etapas.map((etapa) => ({
        id: `${trilha.id}#${etapa.id}`,
        text: etapa.conteudo,
        trilha: trilha.id,
        aula: etapa.id,
        titulo: etapa.titulo,
        autor: trilha.autorId ?? '',
        disponivel: trilha.disponivel ? 'sim' : 'nao'
      }));
      if (registros.length) {
        await this.porta.gravar(registros);
        for (const registro of registros) this.logUpsert(registro.id);
      }
    } catch {
      this.audit.registrar({
        level: 'error',
        event: 'indice.falha',
        outcome: 'falha',
        message: `Falha ao refletir a trilha ${trilhaId} no índice`
      });
    }
  }

  private logUpsert(id: string) {
    this.audit.registrar({
      level: 'info',
      event: 'indice.upsert',
      outcome: 'ok',
      message: `Registro ${id}`
    });
  }

  private logRemovido(id: string) {
    this.audit.registrar({
      level: 'info',
      event: 'indice.removido',
      outcome: 'ok',
      message: `Registro removido ${id}`
    });
  }
}
