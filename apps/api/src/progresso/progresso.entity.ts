import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique
} from 'typeorm';
import { Trilha } from '../catalogo/trilha.entity';
import { Usuario } from '../usuario/usuario.entity';
import { ConclusaoEtapa } from './conclusao-etapa.entity';

@Entity('progresso')
@Unique('uq_progresso_aluno_trilha', ['alunoId', 'trilhaId'])
export class Progresso {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ name: 'data_inicio' })
  dataInicio!: Date;

  @Column({ default: true })
  ativo!: boolean;

  @Column({ name: 'aluno_id' })
  alunoId!: string;

  @Column({ name: 'trilha_id' })
  trilhaId!: string;

  @ManyToOne(() => Usuario, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'aluno_id' })
  aluno!: Usuario;

  @ManyToOne(() => Trilha, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'trilha_id' })
  trilha!: Trilha;

  @OneToMany(() => ConclusaoEtapa, (conclusao) => conclusao.progresso)
  conclusoes!: ConclusaoEtapa[];
}
