import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Perfil } from './perfil';

export class CriarUsuarioDto {
  @IsString()
  @MinLength(1)
  nome!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  senha!: string;

  @IsEnum(Perfil)
  perfil!: Perfil;
}

export class AlterarUsuarioDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  nome?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  senha?: string;

  @IsOptional()
  @IsEnum(Perfil)
  perfil?: Perfil;
}

export type UsuarioResposta = {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
  quantidadeProgressos: number;
  proprio: boolean;
};
