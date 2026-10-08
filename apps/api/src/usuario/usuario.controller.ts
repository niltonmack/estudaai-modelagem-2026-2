import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Perfis, PerfisGuard } from '../auth/perfis.guard';
import { AlterarUsuarioDto, CriarUsuarioDto } from './dto';
import { Perfil } from './perfil';
import { UsuarioService } from './usuario.service';

type ReqUsuario = { user?: { userId?: string; email?: string; perfil?: Perfil } };

@Controller('usuarios')
@UseGuards(JwtAuthGuard, PerfisGuard)
@Perfis(Perfil.Administrador)
export class UsuarioController {
  constructor(private readonly usuarios: UsuarioService) {}

  @Get()
  listar(@Req() req: ReqUsuario) {
    return this.usuarios.listar(this.ator(req));
  }

  @Post()
  criar(@Body() dto: CriarUsuarioDto, @Req() req: ReqUsuario) {
    return this.usuarios.criar(dto, this.ator(req));
  }

  @Get(':id')
  obter(@Param('id', ParseUUIDPipe) id: string, @Req() req: ReqUsuario) {
    return this.usuarios.obter(id, this.ator(req));
  }

  @Patch(':id')
  alterar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AlterarUsuarioDto,
    @Req() req: ReqUsuario
  ) {
    return this.usuarios.alterar(id, dto, this.ator(req));
  }

  @Delete(':id')
  @HttpCode(204)
  remover(@Param('id', ParseUUIDPipe) id: string, @Req() req: ReqUsuario) {
    return this.usuarios.remover(id, this.ator(req));
  }

  private ator(req: ReqUsuario) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('Administrador autenticado sem identificador.');
    }
    return { userId, email: req.user?.email, perfil: req.user?.perfil };
  }
}
