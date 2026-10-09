import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Perfis, PerfisGuard } from '../auth/perfis.guard';
import { Perfil } from '../usuario/perfil';
import { BuscaService } from './busca.service';

class BuscaDto {
  @IsString()
  @MinLength(1)
  texto!: string;
}

type ReqUsuario = { user?: { userId?: string; email?: string; perfil?: Perfil } };

@Controller('busca')
@UseGuards(JwtAuthGuard, PerfisGuard)
@Perfis(Perfil.Aluno)
export class BuscaController {
  constructor(private readonly busca: BuscaService) {}

  @Post()
  @HttpCode(200)
  buscar(@Body() dto: BuscaDto, @Req() req: ReqUsuario) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('Aluno autenticado sem identificador.');
    }
    return this.busca.buscar(dto.texto, {
      userId,
      email: req.user?.email,
      perfil: req.user?.perfil
    });
  }
}
