import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ConfiguracaoController } from './configuracao.controller';
import { ConfiguracaoLlm } from './configuracao-llm.entity';
import { ConfiguracaoLlmService } from './configuracao-llm.service';

@Module({
  imports: [TypeOrmModule.forFeature([ConfiguracaoLlm]), AuthModule],
  controllers: [ConfiguracaoController],
  providers: [ConfiguracaoLlmService],
  exports: [ConfiguracaoLlmService]
})
export class ConfigModule {}
