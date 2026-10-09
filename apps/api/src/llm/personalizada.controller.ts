import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { IsBoolean } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Perfis, PerfisGuard } from '../auth/perfis.guard';
import { Perfil } from '../usuario/perfil';
import { GerarTrilhaPersonalizadaDto } from './dto';
import { PersonalizadaService } from './personalizada.service';

class DisponibilidadeDto {
  @IsBoolean()
  disponivel!: boolean;
}

type ReqUsuario = { user?: { userId?: string; email?: string; perfil?: Perfil } };

@Controller('solicitacoes-trilha')
@UseGuards(JwtAuthGuard, PerfisGuard)
@Perfis(Perfil.Aluno)
export class PersonalizadaController {
  constructor(private readonly personalizada: PersonalizadaService) {}

  @Post()
  gerar(@Body() dto: GerarTrilhaPersonalizadaDto, @Req() req: ReqUsuario) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('Aluno autenticado sem identificador.');
    }
    return this.personalizada.gerar(dto.textoObjetivo, {
      userId,
      email: req.user?.email,
      perfil: req.user?.perfil
    });
  }

  @Get(':progressoId')
  pedido(@Param('progressoId') progressoId: string, @Req() req: ReqUsuario) {
    return this.personalizada.pedido(progressoId, this.ator(req));
  }

  @Patch('trilha/:trilhaId/disponibilidade')
  disponibilidade(
    @Param('trilhaId', ParseUUIDPipe) trilhaId: string,
    @Body() dto: DisponibilidadeDto,
    @Req() req: ReqUsuario
  ) {
    return this.personalizada.definirDisponibilidade(trilhaId, dto.disponivel, this.ator(req));
  }

  @Post(':progressoId')
  ajustar(
    @Param('progressoId') progressoId: string,
    @Body() dto: GerarTrilhaPersonalizadaDto,
    @Req() req: ReqUsuario
  ) {
    return this.personalizada.ajustar(progressoId, dto.textoObjetivo, this.ator(req));
  }

  private ator(req: ReqUsuario) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('Aluno autenticado sem identificador.');
    }
    return { userId, email: req.user?.email, perfil: req.user?.perfil };
  }
}
