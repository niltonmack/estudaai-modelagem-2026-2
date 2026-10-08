import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Trilha } from './trilha.entity';

@Entity('categoria')
@Unique(['nome'])
export class Categoria {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 120 })
  nome!: string;

  @Column({ type: 'text' })
  descricao!: string;

  @OneToMany(() => Trilha, (trilha) => trilha.categoria)
  trilhas!: Trilha[];
}
