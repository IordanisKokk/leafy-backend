import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import { Plant } from "./Plant";

@Entity()
export class WateringLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Plant, p => p.id, { onDelete: "CASCADE" })
  plant!: Plant;

  @Column({ type: "timestamptz", default: () => "NOW()" })
  timestamp!: Date;
}
