import { Controller, Get, Param, ParseUUIDPipe, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Perfis, PerfisGuard } from '../auth/perfis.guard';
import { Perfil } from '../usuario/perfil';
import { ProgressoService } from './progresso.service';

type ReqUsuario = { user?: { userId?: string; email?: string; perfil?: Perfil } };

@Controller('acompanhamentos')
@UseGuards(JwtAuthGuard, PerfisGuard)
@Perfis(Perfil.Administrador)
export class AcompanhamentoController {
  constructor(private readonly progresso: ProgressoService) {}

  @Get()
  listar(@Req() req: ReqUsuario) {
    return this.progresso.listarAcompanhamentos(this.ator(req));
  }

  @Get(':alunoId')
  obterAluno(@Param('alunoId', ParseUUIDPipe) alunoId: string, @Req() req: ReqUsuario) {
    return this.progresso.obterAcompanhamentoAluno(alunoId, this.ator(req));
  }

  @Get(':alunoId/progressos/:progressoId')
  obterProgresso(
    @Param('alunoId', ParseUUIDPipe) alunoId: string,
    @Param('progressoId', ParseUUIDPipe) progressoId: string,
    @Req() req: ReqUsuario
  ) {
    return this.progresso.obterAcompanhamentoProgresso(alunoId, progressoId, this.ator(req));
  }

  private ator(req: ReqUsuario) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('Administrador autenticado sem identificador.');
    }
    return { userId, email: req.user?.email, perfil: req.user?.perfil };
  }
}
