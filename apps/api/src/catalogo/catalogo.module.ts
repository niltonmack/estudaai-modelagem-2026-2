import { Module } from '@nestjs/common';
import { IndiceModule } from '../indice/indice.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CatalogoController } from './catalogo.controller';
import { CatalogoService } from './catalogo.service';
import { Categoria } from './categoria.entity';
import { Etapa } from './etapa.entity';
import { Trilha } from './trilha.entity';
import { Progresso } from '../progresso/progresso.entity';
import { TrilhaController } from './trilha.controller';
import { TrilhaService } from './trilha.service';

@Module({
  imports: [TypeOrmModule.forFeature([Categoria, Trilha, Etapa, Progresso]), AuthModule, IndiceModule],
  controllers: [CatalogoController, TrilhaController],
  providers: [CatalogoService, TrilhaService],
  exports: [CatalogoService, TrilhaService, TypeOrmModule]
})
export class CatalogoModule {}
