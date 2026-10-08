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
import { Perfil } from '../usuario/perfil';
import { CatalogoService } from './catalogo.service';
import { CategoriaDto } from './dto';

type ReqUsuario = { user?: { email?: string; perfil?: Perfil } };

@Controller('categorias')
@UseGuards(JwtAuthGuard, PerfisGuard)
@Perfis(Perfil.Administrador)
export class CatalogoController {
  constructor(private readonly catalogo: CatalogoService) {}

  @Post()
  criar(@Body() dto: CategoriaDto, @Req() req: ReqUsuario) {
    return this.catalogo.criar(dto, { email: req.user?.email, perfil: req.user?.perfil });
  }

  @Get()
  listar() {
    return this.catalogo.listar();
  }

  @Get(':id')
  obter(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalogo.obter(id);
  }

  @Patch(':id')
  alterar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CategoriaDto,
    @Req() req: ReqUsuario
  ) {
    return this.catalogo.alterar(id, dto, { email: req.user?.email, perfil: req.user?.perfil });
  }

  @Delete(':id')
  @HttpCode(204)
  remover(@Param('id', ParseUUIDPipe) id: string, @Req() req: ReqUsuario) {
    return this.catalogo.remover(id, { email: req.user?.email, perfil: req.user?.perfil });
  }
}
