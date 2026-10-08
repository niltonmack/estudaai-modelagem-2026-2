import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Trilha } from './trilha.entity';

@Entity('etapa')
export class Etapa {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 160 })
  titulo!: string;

  @Column({ type: 'text' })
  conteudo!: string;

  @Column({ type: 'int' })
  ordem!: number;

  @ManyToOne(() => Trilha, (trilha) => trilha.etapas, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'trilha_id' })
  trilha!: Trilha;
}
