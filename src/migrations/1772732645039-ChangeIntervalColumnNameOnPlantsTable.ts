import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeIntervalColumnNameOnPlantsTable1772732645039 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasColumn("plant", "wateringFrequencyDays")) {
            return;
        }

        if (await queryRunner.hasColumn("plant", "wateringIntervalDays")) {
            await queryRunner.query(
                `ALTER TABLE "plant" RENAME COLUMN "wateringIntervalDays" TO "wateringFrequencyDays"`
            );
            return;
        }

        if (await queryRunner.hasColumn("plant", "WateringFrequencyDays")) {
            await queryRunner.query(
                `ALTER TABLE "plant" RENAME COLUMN "WateringFrequencyDays" TO "wateringFrequencyDays"`
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasColumn("plant", "wateringIntervalDays")) {
            return;
        }

        if (await queryRunner.hasColumn("plant", "wateringFrequencyDays")) {
            await queryRunner.query(
                `ALTER TABLE "plant" RENAME COLUMN "wateringFrequencyDays" TO "wateringIntervalDays"`
            );
            return;
        }

        if (await queryRunner.hasColumn("plant", "WateringFrequencyDays")) {
            await queryRunner.query(
                `ALTER TABLE "plant" RENAME COLUMN "WateringFrequencyDays" TO "wateringIntervalDays"`
            );
        }
    }

}
