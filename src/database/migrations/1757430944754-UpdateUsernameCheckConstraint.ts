import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUsernameCheckConstraint1757430944754 implements MigrationInterface {
    name = 'UpdateUsernameCheckConstraint1757430944754'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "CHK_faed6256b3c9c55eb01855f630"`);
        await queryRunner.query(`ALTER TABLE "preference" ALTER COLUMN "lineSpacing" SET DEFAULT '1.5'`);
        await queryRunner.query(`ALTER TABLE "preference" ALTER COLUMN "letterSpacing" SET DEFAULT '0.01'`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "CHK_bc972d6a3de381827e1f6349f2" CHECK ("username" ~ '^[A-Za-z0-9 _]+$')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "CHK_bc972d6a3de381827e1f6349f2"`);
        await queryRunner.query(`ALTER TABLE "preference" ALTER COLUMN "letterSpacing" SET DEFAULT 0.01`);
        await queryRunner.query(`ALTER TABLE "preference" ALTER COLUMN "lineSpacing" SET DEFAULT 1.5`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "CHK_faed6256b3c9c55eb01855f630" CHECK (((username)::text ~ '^[A-Za-z0-9]+([A-Za-z0-9]+)*$'::text))`);
    }

}
