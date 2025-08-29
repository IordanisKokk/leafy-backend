import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1756394069737 implements MigrationInterface {
    name = 'InitSchema1756394069737'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "plant_species" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "commonName" character varying NOT NULL, "scientificName" character varying NOT NULL, "description" character varying, "defaultWateringIntervalDays" integer NOT NULL DEFAULT '7', "imageUrl" character varying, "properties" jsonb, "careInstructions" jsonb, CONSTRAINT "UQ_fd66cf2f2257386b447be32211a" UNIQUE ("commonName"), CONSTRAINT "PK_1b66e1a64cc1c6921695c08116f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "plant" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "wateringIntervalDays" integer NOT NULL, "lastWateredAt" TIMESTAMP WITH TIME ZONE, "properties" jsonb, "careInstructions" jsonb, "speciesId" uuid, "ownerId" uuid, CONSTRAINT "PK_97e1eb0d045aadea59401ece5ba" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "watering_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "plantId" uuid, CONSTRAINT "PK_1ba56c540ce538a97ca9b681f5b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "plant" ADD CONSTRAINT "FK_7778484944052d972e129fea871" FOREIGN KEY ("speciesId") REFERENCES "plant_species"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plant" ADD CONSTRAINT "FK_11084c05e21842d33dc77a0b89e" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "watering_log" ADD CONSTRAINT "FK_4b3de169b2914b2c25ecf176150" FOREIGN KEY ("plantId") REFERENCES "plant"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "watering_log" DROP CONSTRAINT "FK_4b3de169b2914b2c25ecf176150"`);
        await queryRunner.query(`ALTER TABLE "plant" DROP CONSTRAINT "FK_11084c05e21842d33dc77a0b89e"`);
        await queryRunner.query(`ALTER TABLE "plant" DROP CONSTRAINT "FK_7778484944052d972e129fea871"`);
        await queryRunner.query(`DROP TABLE "watering_log"`);
        await queryRunner.query(`DROP TABLE "plant"`);
        await queryRunner.query(`DROP TABLE "plant_species"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
