CREATE TABLE usuario (
  id CHAR(36) NOT NULL PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  perfil VARCHAR(20) NOT NULL,
  criado_em DATETIME NOT NULL
);

CREATE TABLE token_revogado (
  jti VARCHAR(64) NOT NULL PRIMARY KEY,
  expira_em DATETIME NOT NULL
);

CREATE TABLE recuperacao_senha (
  id CHAR(36) NOT NULL PRIMARY KEY,
  usuario_id CHAR(36) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expira_em DATETIME NOT NULL,
  usado BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em DATETIME NOT NULL
);

CREATE TABLE categoria (
  id CHAR(36) NOT NULL PRIMARY KEY,
  nome VARCHAR(120) NOT NULL UNIQUE,
  descricao TEXT NOT NULL
);

CREATE TABLE trilha (
  id CHAR(36) NOT NULL PRIMARY KEY,
  titulo VARCHAR(160) NOT NULL,
  descricao TEXT NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  disponivel BOOLEAN NOT NULL DEFAULT FALSE,
  categoria_id CHAR(36) NOT NULL,
  autor_id CHAR(36) NULL,
  FOREIGN KEY (categoria_id) REFERENCES categoria(id),
  FOREIGN KEY (autor_id) REFERENCES usuario(id)
);

CREATE TABLE etapa (
  id CHAR(36) NOT NULL PRIMARY KEY,
  titulo VARCHAR(160) NOT NULL,
  conteudo TEXT NOT NULL,
  ordem INT NOT NULL,
  trilha_id CHAR(36) NOT NULL,
  FOREIGN KEY (trilha_id) REFERENCES trilha(id)
);

CREATE TABLE progresso (
  id CHAR(36) NOT NULL PRIMARY KEY,
  data_inicio DATETIME NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  aluno_id CHAR(36) NOT NULL,
  trilha_id CHAR(36) NOT NULL,
  UNIQUE (aluno_id, trilha_id),
  FOREIGN KEY (aluno_id) REFERENCES usuario(id),
  FOREIGN KEY (trilha_id) REFERENCES trilha(id)
);

CREATE TABLE conclusao_etapa (
  id CHAR(36) NOT NULL PRIMARY KEY,
  data_conclusao DATETIME NOT NULL,
  progresso_id CHAR(36) NOT NULL,
  etapa_id CHAR(36) NOT NULL,
  FOREIGN KEY (progresso_id) REFERENCES progresso(id),
  FOREIGN KEY (etapa_id) REFERENCES etapa(id)
);

CREATE TABLE configuracao_llm (
  id VARCHAR(16) NOT NULL PRIMARY KEY,
  habilitado BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE solicitacao_trilha (
  id CHAR(36) NOT NULL PRIMARY KEY,
  texto_objetivo TEXT NOT NULL,
  resposta_llm TEXT NOT NULL,
  data_solicitacao DATETIME NOT NULL,
  aluno_id CHAR(36) NOT NULL,
  trilha_id CHAR(36) NOT NULL UNIQUE,
  FOREIGN KEY (aluno_id) REFERENCES usuario(id),
  FOREIGN KEY (trilha_id) REFERENCES trilha(id)
);

CREATE TABLE mensagem (
  id CHAR(36) NOT NULL PRIMARY KEY,
  texto TEXT NOT NULL,
  data_envio DATETIME NOT NULL,
  origem VARCHAR(20) NOT NULL,
  aluno_id CHAR(36) NOT NULL,
  trilha_id CHAR(36) NOT NULL,
  FOREIGN KEY (aluno_id) REFERENCES usuario(id),
  FOREIGN KEY (trilha_id) REFERENCES trilha(id)
);

