import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Categoria } from './categoria.entity';
import { Etapa } from './etapa.entity';

@Entity('trilha')
export class Trilha {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 160 })
  titulo!: string;

  @Column({ type: 'text' })
  descricao!: string;

  @Column({ type: 'varchar', length: 20 })
  tipo!: 'pré-definida' | 'personalizada';

  @Column({ default: false })
  disponivel!: boolean;

  @ManyToOne(() => Categoria, (categoria) => categoria.trilhas, {
    nullable: false,
    onDelete: 'RESTRICT'
  })
  @JoinColumn({ name: 'categoria_id' })
  categoria!: Categoria;

  @OneToMany(() => Etapa, (etapa) => etapa.trilha, { cascade: true })
  etapas!: Etapa[];
}
