import { Check, Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Unique(['name'])
@Check(
  `LOWER("name") IN ('visual', 'auditiva', 'cognitiva e neural', 'motora', 'tea')`,
)
@Entity()
export class Deficiency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: '15' })
  name: string;
}
