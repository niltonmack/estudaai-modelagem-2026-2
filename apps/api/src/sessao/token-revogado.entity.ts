import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('token_revogado')
export class TokenRevogado {
  @PrimaryColumn({ length: 64 })
  jti!: string;

  @Column({ name: 'expira_em', type: 'datetime' })
  expiraEm!: Date;
}
