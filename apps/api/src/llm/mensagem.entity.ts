import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Trilha } from '../catalogo/trilha.entity';
import { Usuario } from '../usuario/usuario.entity';

export type OrigemMensagem = 'aluno' | 'agente LLM';

@Entity('mensagem')
export class Mensagem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  texto!: string;

  @CreateDateColumn({ name: 'data_envio' })
  dataEnvio!: Date;

  @Column({ type: 'varchar', length: 20 })
  origem!: OrigemMensagem;

  @Column({ name: 'aluno_id' })
  alunoId!: string;

  @ManyToOne(() => Usuario, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'aluno_id' })
  aluno!: Usuario;

  @Column({ name: 'trilha_id' })
  trilhaId!: string;

  @ManyToOne(() => Trilha, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'trilha_id' })
  trilha!: Trilha;
}
