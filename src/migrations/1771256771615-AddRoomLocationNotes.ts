import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoomLocationNotes1771256771615 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "plant" ADD COLUMN "room" character varying`);
        await queryRunner.query(`ALTER TABLE "plant" ADD COLUMN "location" character varying`);
        await queryRunner.query(`ALTER TABLE "plant" ADD COLUMN "notes" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "plant" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "plant" DROP COLUMN "location"`);
        await queryRunner.query(`ALTER TABLE "plant" DROP COLUMN "room"`);
    }

}
