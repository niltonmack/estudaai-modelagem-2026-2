import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '../config/config.module';
import { Etapa } from '../catalogo/etapa.entity';
import { Trilha } from '../catalogo/trilha.entity';
import { Usuario } from '../usuario/usuario.entity';
import { AcompanhamentoController } from './acompanhamento.controller';
import { CatalogoPublicoController } from './catalogo-publico.controller';
import { ConclusaoEtapa } from './conclusao-etapa.entity';
import { ProgressoController } from './progresso.controller';
import { Progresso } from './progresso.entity';
import { ProgressoService } from './progresso.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Progresso, ConclusaoEtapa, Trilha, Etapa, Usuario]),
    AuthModule,
    ConfigModule
  ],
  controllers: [CatalogoPublicoController, ProgressoController, AcompanhamentoController],
  providers: [ProgressoService],
  exports: [ProgressoService]
})
export class ProgressoModule {}
