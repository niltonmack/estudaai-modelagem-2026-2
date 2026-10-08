import { IsEmail, IsString, MinLength } from 'class-validator';

export class CadastroDto {
  @IsString()
  @MinLength(1)
  nome!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  senha!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  senha!: string;
}

export class RecuperacaoDto {
  @IsEmail()
  email!: string;
}

export class RedefinirSenhaDto {
  @IsString()
  @MinLength(1)
  token!: string;

  @IsString()
  @MinLength(1)
  senha!: string;
}
