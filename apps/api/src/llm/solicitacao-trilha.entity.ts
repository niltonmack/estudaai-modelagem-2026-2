import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Trilha } from '../catalogo/trilha.entity';
import { Usuario } from '../usuario/usuario.entity';

@Entity('solicitacao_trilha')
export class SolicitacaoTrilha {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'texto_objetivo', type: 'text' })
  textoObjetivo!: string;

  @Column({ name: 'resposta_llm', type: 'text' })
  respostaLLM!: string;

  @CreateDateColumn({ name: 'data_solicitacao' })
  dataSolicitacao!: Date;

  @Column({ name: 'aluno_id' })
  alunoId!: string;

  @ManyToOne(() => Usuario, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'aluno_id' })
  aluno!: Usuario;

  @Column({ name: 'trilha_id' })
  trilhaId!: string;

  @OneToOne(() => Trilha, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'trilha_id' })
  trilha!: Trilha;
}
