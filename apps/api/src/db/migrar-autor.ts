import { DataSource } from 'typeorm';

/** Preenche o autor das personalizadas antigas e as deixa indisponíveis uma única vez. */
export async function migrarAutoria(dados: DataSource): Promise<void> {
  if (dados.options.type === 'mysql') {
    const colunas = (await dados.query(
      `SELECT COLUMN_NAME AS nome
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'trilha' AND COLUMN_NAME = 'autor_id'`
    )) as { nome: string }[];
    if (!colunas.length) {
      await dados.query('ALTER TABLE trilha ADD COLUMN autor_id CHAR(36) NULL');
      await dados.query(
        'ALTER TABLE trilha ADD CONSTRAINT fk_trilha_autor FOREIGN KEY (autor_id) REFERENCES usuario(id)'
      );
    }
  }

  await dados.query(
    `UPDATE trilha
     SET autor_id = (SELECT aluno_id FROM solicitacao_trilha WHERE trilha_id = trilha.id),
         disponivel = 0
     WHERE tipo = 'personalizada'
       AND autor_id IS NULL
       AND EXISTS (SELECT 1 FROM solicitacao_trilha s WHERE s.trilha_id = trilha.id)`
  );
}
