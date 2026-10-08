import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CatalogoModule } from './catalogo/catalogo.module';
import { ConfigModule } from './config/config.module';
import { opcoesTypeOrm } from './db/opcoes-typeorm';
import { LlmModule } from './llm/llm.module';
import { ProgressoModule } from './progresso/progresso.module';
import { UsuarioModule } from './usuario/usuario.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => opcoesTypeOrm()
    }),
    AuthModule,
    CatalogoModule,
    ProgressoModule,
    ConfigModule,
    LlmModule,
    UsuarioModule
  ]
})
export class AppModule {}
