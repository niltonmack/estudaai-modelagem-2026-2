import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('recuperacao_senha')
export class RecuperacaoSenha {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'usuario_id' })
  usuarioId!: string;

  @Column({ name: 'token_hash', length: 64 })
  tokenHash!: string;

  @Column({ name: 'expira_em', type: 'datetime' })
  expiraEm!: Date;

  @Column({ default: false })
  usado!: boolean;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm!: Date;
}
