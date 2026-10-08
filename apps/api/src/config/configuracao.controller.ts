import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Perfis, PerfisGuard } from '../auth/perfis.guard';
import { Perfil } from '../usuario/perfil';
import { ConfiguracaoLlmService } from './configuracao-llm.service';
import { InterruptorLlmDto } from './dto';

type ReqUsuario = { user?: { email?: string; perfil?: Perfil } };

@Controller('configuracao')
@UseGuards(JwtAuthGuard, PerfisGuard)
export class ConfiguracaoController {
  constructor(private readonly configuracao: ConfiguracaoLlmService) {}

  @Get('llm')
  consultar() {
    return this.configuracao.obter();
  }

  @Post('llm')
  @HttpCode(204)
  @Perfis(Perfil.Administrador)
  async interruptor(@Body() dto: InterruptorLlmDto, @Req() req: ReqUsuario) {
    await this.configuracao.definir(dto.habilitado, {
      email: req.user?.email,
      perfil: req.user?.perfil
    });
  }
}
