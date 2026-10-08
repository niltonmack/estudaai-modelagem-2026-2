import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { CatalogoService } from './catalogo/catalogo.service';
import { ConfiguracaoLlmService } from './config/configuracao-llm.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const admin = await app.get(AuthService).seedAdministrador();
  const sentinela = await app.get(CatalogoService).seedPersonalizada();
  const llm = await app.get(ConfiguracaoLlmService).seed();
  Logger.log(JSON.stringify({ admin, sentinela, llm }), 'Seed');
  await app.close();
}

void seed();
