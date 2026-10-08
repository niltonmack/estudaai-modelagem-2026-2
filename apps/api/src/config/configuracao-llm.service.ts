import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogger } from '../audit/audit.logger';
import { Perfil } from '../usuario/perfil';
import { ConfiguracaoLlm } from './configuracao-llm.entity';

const ID_UNICO = 'unico';

type Ator = { email?: string; perfil?: Perfil };

@Injectable()
export class ConfiguracaoLlmService {
  constructor(
    @InjectRepository(ConfiguracaoLlm) private readonly repo: Repository<ConfiguracaoLlm>,
    private readonly audit: AuditLogger
  ) {}

  async seed() {
    const existente = await this.repo.findOneBy({ id: ID_UNICO });
    if (existente) return { criado: false, habilitado: existente.habilitado };
    const criado = await this.repo.save(this.repo.create({ id: ID_UNICO, habilitado: false }));
    return { criado: true, habilitado: criado.habilitado };
  }

  async habilitado(): Promise<boolean> {
    const row = await this.repo.findOneBy({ id: ID_UNICO });
    return row?.habilitado ?? false;
  }

  async obter(): Promise<{ habilitado: boolean }> {
    await this.seed();
    return { habilitado: await this.habilitado() };
  }

  async definir(habilitado: boolean, ator: Ator): Promise<{ habilitado: boolean }> {
    await this.seed();
    const row = await this.repo.findOneByOrFail({ id: ID_UNICO });
    row.habilitado = habilitado;
    await this.repo.save(row);
    this.audit.registrar({
      level: 'info',
      event: 'llm.interruptor.alterado',
      outcome: 'ok',
      email: ator.email,
      perfil: 'administrador',
      message: habilitado ? 'LLM habilitado' : 'LLM desabilitado'
    });
    return { habilitado: row.habilitado };
  }
}
