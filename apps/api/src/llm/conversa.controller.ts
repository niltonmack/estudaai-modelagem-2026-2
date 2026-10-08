import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Perfis, PerfisGuard } from '../auth/perfis.guard';
import { Perfil } from '../usuario/perfil';
import { ConversaService } from './conversa.service';
import { EnviarMensagemDto } from './dto';

type ReqUsuario = { user?: { userId?: string; email?: string; perfil?: Perfil } };

@Controller('progresso')
@UseGuards(JwtAuthGuard, PerfisGuard)
@Perfis(Perfil.Aluno)
export class ConversaController {
  constructor(private readonly conversa: ConversaService) {}

  @Get(':id/mensagens')
  listar(@Param('id', ParseUUIDPipe) id: string, @Req() req: ReqUsuario) {
    return this.conversa.listar(id, this.ator(req));
  }

  @Post(':id/mensagens')
  enviar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EnviarMensagemDto,
    @Req() req: ReqUsuario
  ) {
    return this.conversa.enviar(id, dto.texto, this.ator(req));
  }

  private ator(req: ReqUsuario) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('Aluno autenticado sem identificador.');
    }
    return { userId, email: req.user?.email, perfil: req.user?.perfil };
  }
}
