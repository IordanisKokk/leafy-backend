import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { CareInstructions, SpeciesProperties } from '../types/species';

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

    @Column({ type: "jsonb", nullable: false })
    properties!: SpeciesProperties;

    @Column({ type: "jsonb", nullable: false })
    careInstructions!: CareInstructions;
}
