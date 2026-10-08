import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CadastroDto, LoginDto, RecuperacaoDto, RedefinirSenhaDto } from './dto';
import { Perfil } from '../usuario/perfil';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('cadastro')
  async cadastro(@Body() dto: CadastroDto) {
    return this.auth.cadastrarAluno(dto.nome, dto.email, dto.senha);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.senha);
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: { user?: { jti: string; email: string; perfil: Perfil } }) {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    await this.auth.logout(req.user.jti, req.user.email, req.user.perfil);
  }

  @Post('recuperacao')
  @HttpCode(200)
  async recuperacao(@Body() dto: RecuperacaoDto) {
    await this.auth.solicitarRecuperacao(dto.email);
    return {
      mensagem: 'Se o e-mail estiver cadastrado, o procedimento de redefinição foi enviado.'
    };
  }

  @Post('redefinir-senha')
  @HttpCode(204)
  async redefinir(@Body() dto: RedefinirSenhaDto) {
    await this.auth.redefinirSenha(dto.token, dto.senha);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: { user?: { userId: string; email: string; perfil: string } }) {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    return { id: req.user.userId, email: req.user.email, perfil: req.user.perfil };
  }
}
