import { Controller, Get } from '@nestjs/common';
import { ProgressoService } from './progresso.service';

@Controller('catalogo')
export class CatalogoPublicoController {
  constructor(private readonly progresso: ProgressoService) {}

  @Get()
  listar() {
    return this.progresso.catalogoPublico();
  }
}
