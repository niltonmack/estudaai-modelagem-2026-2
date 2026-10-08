import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Perfil } from './perfil';

@Entity('usuario')
@Unique(['email'])
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 120 })
  nome!: string;

  @Column({ length: 255 })
  email!: string;

  @Column({ name: 'senha_hash', length: 255 })
  senhaHash!: string;

  @Column({ type: 'varchar', length: 20 })
  perfil!: Perfil;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm!: Date;
}
