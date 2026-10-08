import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogger } from '../audit/audit.logger';
import { ConsoleEnvioEmail, EnvioEmail, MemoriaEnvioEmail } from '../email/envio-email';
import { RecuperacaoSenha } from '../sessao/recuperacao-senha.entity';
import { TokenRevogado } from '../sessao/token-revogado.entity';
import { Usuario } from '../usuario/usuario.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { PerfisGuard } from './perfis.guard';

export const ENVIO_EMAIL = 'ENVIO_EMAIL';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, TokenRevogado, RecuperacaoSenha]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'troque-este-segredo-em-desenvolvimento',
      signOptions: { expiresIn: 60 * 60 * 8 }
    })
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    PerfisGuard,
    AuditLogger,
    {
      provide: EnvioEmail,
      useFactory: () =>
        process.env.NODE_ENV === 'test' ? new MemoriaEnvioEmail() : new ConsoleEnvioEmail()
    }
  ],
  exports: [AuthService, AuditLogger, EnvioEmail, JwtModule, TypeOrmModule, PerfisGuard, JwtAuthGuard]
})
export class AuthModule {}
