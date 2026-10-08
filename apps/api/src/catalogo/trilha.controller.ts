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
import { EtapaDto, ReordenarEtapasDto, TrilhaDto } from './dto';
import { TrilhaService } from './trilha.service';

type ReqUsuario = { user?: { email?: string; perfil?: Perfil } };

@Controller('trilhas')
@UseGuards(JwtAuthGuard, PerfisGuard)
@Perfis(Perfil.Administrador)
export class TrilhaController {
  constructor(private readonly trilhas: TrilhaService) {}

  @Post()
  criar(@Body() dto: TrilhaDto, @Req() req: ReqUsuario) {
    return this.trilhas.criar(dto, this.ator(req));
  }

  @Get()
  listar() {
    return this.trilhas.listar();
  }

  @Get(':id')
  obter(@Param('id', ParseUUIDPipe) id: string) {
    return this.trilhas.obter(id);
  }

  @Patch(':id')
  alterar(@Param('id', ParseUUIDPipe) id: string, @Body() dto: TrilhaDto, @Req() req: ReqUsuario) {
    return this.trilhas.alterar(id, dto, this.ator(req));
  }

  @Delete(':id')
  @HttpCode(204)
  remover(@Param('id', ParseUUIDPipe) id: string, @Req() req: ReqUsuario) {
    return this.trilhas.remover(id, this.ator(req));
  }

  @Post(':id/publicar')
  publicar(@Param('id', ParseUUIDPipe) id: string, @Req() req: ReqUsuario) {
    return this.trilhas.publicar(id, this.ator(req));
  }

  @Post(':id/etapas')
  criarEtapa(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EtapaDto,
    @Req() req: ReqUsuario
  ) {
    return this.trilhas.criarEtapa(id, dto, this.ator(req));
  }

  @Patch(':id/etapas/ordem')
  reordenar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReordenarEtapasDto,
    @Req() req: ReqUsuario
  ) {
    return this.trilhas.reordenar(id, dto, this.ator(req));
  }

  @Patch(':id/etapas/:etapaId')
  alterarEtapa(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('etapaId', ParseUUIDPipe) etapaId: string,
    @Body() dto: EtapaDto,
    @Req() req: ReqUsuario
  ) {
    return this.trilhas.alterarEtapa(id, etapaId, dto, this.ator(req));
  }

  @Delete(':id/etapas/:etapaId')
  removerEtapa(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('etapaId', ParseUUIDPipe) etapaId: string,
    @Req() req: ReqUsuario
  ) {
    return this.trilhas.removerEtapa(id, etapaId, this.ator(req));
  }

  private ator(req: ReqUsuario) {
    return { email: req.user?.email, perfil: req.user?.perfil };
  }
}
