import { existsSync } from 'fs';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { Categoria } from '../catalogo/categoria.entity';
import { Etapa } from '../catalogo/etapa.entity';
import { Trilha } from '../catalogo/trilha.entity';
import { ConfiguracaoLlm } from '../config/configuracao-llm.entity';
import { SolicitacaoTrilha } from '../llm/solicitacao-trilha.entity';
import { Mensagem } from '../llm/mensagem.entity';
import { ConclusaoEtapa } from '../progresso/conclusao-etapa.entity';
import { Progresso } from '../progresso/progresso.entity';
import { RecuperacaoSenha } from '../sessao/recuperacao-senha.entity';
import { TokenRevogado } from '../sessao/token-revogado.entity';
import { Usuario } from '../usuario/usuario.entity';

const entidades = [
  Usuario,
  TokenRevogado,
  RecuperacaoSenha,
  Categoria,
  Trilha,
  Etapa,
  Progresso,
  ConclusaoEtapa,
  ConfiguracaoLlm,
  SolicitacaoTrilha,
  Mensagem
];

function arquivoSqlJs(file: string) {
  const candidatos = [
    join(process.cwd(), 'node_modules', 'sql.js', 'dist', file),
    join(process.cwd(), '..', '..', 'node_modules', 'sql.js', 'dist', file),
    join(__dirname, '..', '..', '..', '..', 'node_modules', 'sql.js', 'dist', file)
  ];
  return candidatos.find((p) => existsSync(p)) ?? candidatos[1];
}

export function opcoesTypeOrm(): TypeOrmModuleOptions {
  const usarMemoria = process.env.NODE_ENV === 'test' || process.env.DB_TYPE === 'sqljs';
  if (usarMemoria) {
    return {
      type: 'sqljs',
      autoSave: false,
      entities: entidades,
      synchronize: true,
      dropSchema: process.env.NODE_ENV === 'test',
      sqlJsConfig: { locateFile: arquivoSqlJs }
    };
  }

  return {
    type: 'mysql',
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USER ?? 'estudaai',
    password: process.env.DB_PASSWORD ?? 'estudaai',
    database: process.env.DB_NAME ?? 'estudaai',
    entities: entidades,
    synchronize: process.env.NODE_ENV !== 'production'
  };
}
