import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeIntervalColumnNameOnPlantsTable1772732645039 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "plant" RENAME COLUMN "wateringIntervalDays" TO "wateringFrequencyDays"`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "plant" RENAME COLUMN "wateringFrequencyDays" TO "wateringIntervalDays"`
        );
    }

}
