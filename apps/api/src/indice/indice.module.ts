import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Etapa } from '../catalogo/etapa.entity';
import { Trilha } from '../catalogo/trilha.entity';
import { Progresso } from '../progresso/progresso.entity';
import { BuscaController } from './busca.controller';
import { BuscaService } from './busca.service';
import { FakeIndiceAdapter } from './fake.adapter';
import { IndiceService } from './indice.service';
import { PineconeIndiceAdapter } from './pinecone.adapter';
import { PORTA_INDICE } from './porta-indice';

@Module({
  imports: [TypeOrmModule.forFeature([Trilha, Etapa, Progresso]), AuthModule],
  controllers: [BuscaController],
  providers: [
    IndiceService,
    BuscaService,
    {
      provide: PORTA_INDICE,
      useClass: process.env.NODE_ENV === 'test' ? FakeIndiceAdapter : PineconeIndiceAdapter
    }
  ],
  exports: [IndiceService, PORTA_INDICE]
})
export class IndiceModule {}
