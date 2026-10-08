import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Etapa } from '../catalogo/etapa.entity';
import { Progresso } from './progresso.entity';

@Entity('conclusao_etapa')
@Unique('uq_conclusao_progresso_etapa', ['progressoId', 'etapaId'])
export class ConclusaoEtapa {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ name: 'data_conclusao' })
  dataConclusao!: Date;

  @Column({ name: 'progresso_id' })
  progressoId!: string;

  @Column({ name: 'etapa_id' })
  etapaId!: string;

  @ManyToOne(() => Progresso, (progresso) => progresso.conclusoes, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'progresso_id' })
  progresso!: Progresso;

  @ManyToOne(() => Etapa, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'etapa_id' })
  etapa!: Etapa;
}
