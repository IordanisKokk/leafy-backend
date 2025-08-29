import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class PlantSpecies {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    commonName!: string;
    
    @Column()
    scientificName!: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ type: "int", default: 7 })
    defaultWateringIntervalDays!: number;
    
    @Column({ nullable: true })
    imageUrl?: string;

    @Column({ type: 'jsonb', nullable: true })
    properties?: Record<string, any>;

    @Column({ type: 'jsonb', nullable: true })
    careInstructions?: Record<string, any>;
}
