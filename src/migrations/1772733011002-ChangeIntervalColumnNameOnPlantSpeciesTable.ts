import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeIntervalColumnNameOnPlantSpeciesTable1772733011002 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "plant_species" RENAME COLUMN "defaultWateringIntervalDays" TO "defaultWateringFrequencyDays"`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "plant_species" RENAME COLUMN "defaultWateringFrequencyDays" TO "defaultWateringIntervalDays"`
        );
    }
}
