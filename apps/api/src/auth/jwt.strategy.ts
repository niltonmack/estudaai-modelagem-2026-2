import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { TokenRevogado } from '../sessao/token-revogado.entity';
import { Perfil } from '../usuario/perfil';

export type JwtPayload = {
  sub: string;
  email: string;
  perfil: Perfil;
  jti: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(TokenRevogado)
    private readonly revogados: Repository<TokenRevogado>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'troque-este-segredo-em-desenvolvimento'
    });
  }

  async validate(payload: JwtPayload) {
    const revogado = await this.revogados.findOne({ where: { jti: payload.jti } });
    if (revogado) {
      throw new UnauthorizedException();
    }
    return {
      userId: payload.sub,
      email: payload.email,
      perfil: payload.perfil,
      jti: payload.jti
    };
  }
}
