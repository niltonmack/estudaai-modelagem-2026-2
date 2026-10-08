import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuditLogger } from '../audit/audit.logger';
import { Perfil } from '../usuario/perfil';

export const PERFIS_KEY = 'perfis';
export const Perfis = (...perfis: Perfil[]) => SetMetadata(PERFIS_KEY, perfis);

@Injectable()
export class PerfisGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly audit: AuditLogger
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const exigidos = this.reflector.getAllAndOverride<Perfil[]>(PERFIS_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (!exigidos || exigidos.length === 0) {
      return true;
    }
    const req = context.switchToHttp().getRequest();
    const usuario = req.user as { email?: string; perfil?: Perfil } | undefined;
    if (!usuario?.perfil || !exigidos.includes(usuario.perfil)) {
      this.audit.registrar({
        level: 'warn',
        event: 'auth.autorizacao.recusada',
        outcome: 'recusado',
        email: usuario?.email,
        perfil: usuario?.perfil ?? 'anonimo',
        message: 'Perfil sem permissão para a operação'
      });
      throw new ForbiddenException('Operação recusada para este perfil.');
    }
    return true;
  }
}
