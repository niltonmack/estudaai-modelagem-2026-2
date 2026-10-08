import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Categoria } from '../catalogo/categoria.entity';
import { Etapa } from '../catalogo/etapa.entity';
import { Trilha } from '../catalogo/trilha.entity';
import { ConfigModule } from '../config/config.module';
import { Progresso } from '../progresso/progresso.entity';
import { ProgressoModule } from '../progresso/progresso.module';
import { Usuario } from '../usuario/usuario.entity';
import { FakeLlmAdapter } from './fake.adapter';
import { GeminiLlmAdapter } from './gemini.adapter';
import { Mensagem } from './mensagem.entity';
import { PersonalizadaController } from './personalizada.controller';
import { PersonalizadaService } from './personalizada.service';
import { ConversaController } from './conversa.controller';
import { ConversaService } from './conversa.service';
import { LLM_TIMEOUT_MS, PORTA_LLM, TIMEOUT_LLM_PADRAO_MS } from './porta-llm';
import { SolicitacaoTrilha } from './solicitacao-trilha.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SolicitacaoTrilha, Mensagem, Trilha, Etapa, Progresso, Categoria, Usuario]),
    AuthModule,
    ConfigModule,
    ProgressoModule
  ],
  controllers: [PersonalizadaController, ConversaController],
  providers: [
    PersonalizadaService,
    ConversaService,
    {
      provide: PORTA_LLM,
      useClass: process.env.NODE_ENV === 'test' ? FakeLlmAdapter : GeminiLlmAdapter
    },
    {
      provide: LLM_TIMEOUT_MS,
      useValue: TIMEOUT_LLM_PADRAO_MS
    }
  ],
  exports: [PORTA_LLM, PersonalizadaService]
})
export class LlmModule {}
