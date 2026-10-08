import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('configuracao_llm')
export class ConfiguracaoLlm {
  @PrimaryColumn({ type: 'varchar', length: 16 })
  id!: string;

  @Column({ default: false })
  habilitado!: boolean;
}
