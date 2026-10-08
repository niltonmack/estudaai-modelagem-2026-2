import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Perfis, PerfisGuard } from '../auth/perfis.guard';
import { Perfil } from '../usuario/perfil';
import { EscolherTrilhaDto } from './dto';
import { ProgressoService } from './progresso.service';

type ReqUsuario = { user?: { userId?: string; email?: string; perfil?: Perfil } };

@Controller('progresso')
@UseGuards(JwtAuthGuard, PerfisGuard)
@Perfis(Perfil.Aluno)
export class ProgressoController {
  constructor(private readonly progresso: ProgressoService) {}

  @Post('escolher-trilha')
  async escolher(
    @Body() dto: EscolherTrilhaDto,
    @Req() req: ReqUsuario,
    @Res({ passthrough: true }) res: Response
  ) {
    const detalhe = await this.progresso.escolher(dto.trilhaId, this.ator(req));
    res.status(detalhe.retomado ? 200 : 201);
    return detalhe;
  }

  @Get()
  listar(@Req() req: ReqUsuario) {
    return this.progresso.listar(this.ator(req));
  }

  @Get(':id')
  obter(@Param('id', ParseUUIDPipe) id: string, @Req() req: ReqUsuario) {
    return this.progresso.obter(id, this.ator(req));
  }

  @Post(':id/etapas/:etapaId/conclusao')
  @HttpCode(200)
  concluir(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('etapaId', ParseUUIDPipe) etapaId: string,
    @Req() req: ReqUsuario
  ) {
    return this.progresso.concluir(id, etapaId, this.ator(req));
  }

  private ator(req: ReqUsuario) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('Aluno autenticado sem identificador.');
    }
    return { userId, email: req.user?.email, perfil: req.user?.perfil };
  }
}
