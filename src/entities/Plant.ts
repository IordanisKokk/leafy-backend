import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
} from "typeorm";
import { User } from "./User";
import { PlantSpecies } from "./PlantSpecies";


@Entity()
export class Plant {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string;

    @Column({ type: "int" })
    wateringIntervalDays!: number;

    @Column({ type: "timestamptz", nullable: true })
    lastWateredAt?: Date;

    @Column({ nullable: true })
    room?: string;

    @Column({ nullable: true })
    location?: string;

    @Column({ nullable: true })
    notes?: string;

    @Column({ type: "jsonb", nullable: true })
    careInstructions?: Record<string, any>;

    @ManyToOne(() => PlantSpecies, { eager: true })
    species!: PlantSpecies;

    @ManyToOne(() => User, (user) => user.id, { onDelete: "CASCADE" })
    owner!: User;
}