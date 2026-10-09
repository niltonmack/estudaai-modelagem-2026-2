import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { appendFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { AuditLogger } from './audit/audit.logger';
import { AuthService } from './auth/auth.service';
import { CatalogoService } from './catalogo/catalogo.service';
import { migrarAutoria } from './db/migrar-autor';
import { ConfiguracaoLlmService } from './config/configuracao-llm.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  if (process.env.NODE_ENV !== 'production') {
    const arquivo = resolve(process.cwd(), process.env.LOG_FILE ?? '../../logs/estudaai.log');
    mkdirSync(dirname(arquivo), { recursive: true });
    const audit = app.get(AuditLogger);
    const original = audit.registrar.bind(audit);
    audit.registrar = (parcial) => {
      const registro = original(parcial);
      appendFileSync(arquivo, JSON.stringify(registro) + '\n');
      return registro;
    };
  }

  await migrarAutoria(app.get(DataSource));
  const auth = app.get(AuthService);
  await auth.seedAdministrador();
  await app.get(CatalogoService).seedPersonalizada();
  await app.get(ConfiguracaoLlmService).seed();

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  Logger.log(`API EstudaAI na porta ${port}`, 'Bootstrap');
}

void bootstrap();
