import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovePropertiesFromPlant1771256908091 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "plant" DROP COLUMN "properties"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "plant" ADD COLUMN "properties" jsonb`);
    }

}
