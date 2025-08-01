import { Check, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Check(`UPPER("theme") IN ('LIGHT', 'DARK')`)
@Check(`"brightness" >= 0 AND "brightness" <= 100`)
@Check(
  `LOWER("fontFamily") IN ('arial', 'calibri', 'helvetica', 'tahoma', 'times new roman', 'verdana')`,
)
@Check(`LOWER("fontSize") IN ('sm', 'md', 'lg', 'xlg')`)
@Check(`"lineSpacing" >= 1.5 AND "lineSpacing" <= 3`)
@Check(`"letterSpacing" >= 0.01 AND "letterSpacing" <= 0.2`)
@Check(`LOWER("cursorSize") IN ('sm', 'md', 'lg')`)
@Check(
  `UPPER("cursorColor") IN ('F7C8D4', 'A7C7E7', 'A8E6CF', 'C9A7E4', 'F5C6A5', 'F8E79D')`,
)
@Entity()
export class Preference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30, nullable: false, default: 'LIGHT' })
  theme: string;

  @Column({ type: 'smallint', nullable: false, default: 100 })
  brightness: number;

  @Column({ type: 'varchar', length: 30, nullable: false, default: 'arial' })
  fontFamily: string;

  @Column({ type: 'varchar', length: 3, nullable: false, default: 'md' })
  fontSize: string;

  @Column({
    type: 'decimal',
    precision: 2,
    scale: 1,
    nullable: false,
    default: 1.5,
  })
  lineSpacing: number;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    nullable: false,
    default: 0.01,
  })
  letterSpacing: number;

  @Column({ type: 'varchar', length: 2, nullable: false, default: 'md' })
  cursorSize: string;

  @Column({ type: 'varchar', length: 6, nullable: false, default: 'F7C8D4' })
  cursorColor: string;
}
