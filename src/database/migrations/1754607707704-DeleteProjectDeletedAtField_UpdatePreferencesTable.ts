import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteProjectDeletedAtFieldUpdatePreferencesTable1754607707704 implements MigrationInterface {
    name = 'DeleteProjectDeletedAtFieldUpdatePreferencesTable1754607707704'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "preference" DROP CONSTRAINT "CHK_260ad515c220486fb6068fe6a6"`);
        await queryRunner.query(`ALTER TABLE "preference" DROP CONSTRAINT "CHK_512c79e6936b319e8bca9942c0"`);
        await queryRunner.query(`ALTER TABLE "preference" DROP CONSTRAINT "CHK_c6bd0892246cb2e435b1ea1e9c"`);
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "preference" ALTER COLUMN "lineSpacing" SET DEFAULT '1.5'`);
        await queryRunner.query(`ALTER TABLE "preference" ALTER COLUMN "letterSpacing" SET DEFAULT '0.01'`);
        await queryRunner.query(`ALTER TABLE "preference" ADD CONSTRAINT "CHK_f363261ddaec6c88b4fe053994" CHECK ("letterSpacing" >= 0.01 AND "letterSpacing" <= 0.2)`);
        await queryRunner.query(`ALTER TABLE "preference" ADD CONSTRAINT "CHK_c022911e38344befe22141a627" CHECK ("lineSpacing" >= 1.5 AND "lineSpacing" <= 3)`);
        await queryRunner.query(`ALTER TABLE "preference" ADD CONSTRAINT "CHK_837ab38b714ee25b640410ee23" CHECK ("brightness" >= 0 AND "brightness" <= 100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "preference" DROP CONSTRAINT "CHK_837ab38b714ee25b640410ee23"`);
        await queryRunner.query(`ALTER TABLE "preference" DROP CONSTRAINT "CHK_c022911e38344befe22141a627"`);
        await queryRunner.query(`ALTER TABLE "preference" DROP CONSTRAINT "CHK_f363261ddaec6c88b4fe053994"`);
        await queryRunner.query(`ALTER TABLE "preference" ALTER COLUMN "letterSpacing" SET DEFAULT 0.01`);
        await queryRunner.query(`ALTER TABLE "preference" ALTER COLUMN "lineSpacing" SET DEFAULT 1.5`);
        await queryRunner.query(`ALTER TABLE "project" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "preference" ADD CONSTRAINT "CHK_c6bd0892246cb2e435b1ea1e9c" CHECK (((brightness >= 0) AND (brightness <= 100)))`);
        await queryRunner.query(`ALTER TABLE "preference" ADD CONSTRAINT "CHK_512c79e6936b319e8bca9942c0" CHECK ((("lineSpacing" >= 1.5) AND ("lineSpacing" <= (3)::numeric)))`);
        await queryRunner.query(`ALTER TABLE "preference" ADD CONSTRAINT "CHK_260ad515c220486fb6068fe6a6" CHECK ((("letterSpacing" >= 0.01) AND ("letterSpacing" <= 0.2)))`);
    }

}
