import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPreferenceTableModifyDateTypesAndFieldLengths1754058148495
  implements MigrationInterface
{
  name = 'AddPreferenceTableModifyDateTypesAndFieldLengths1754058148495';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "guideline" DROP CONSTRAINT "CHK_1d85d193ca74fc1416809e72e4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "CHK_6554a78eec89265385de2ebc17"`,
    );
    await queryRunner.query(
      `CREATE TABLE "preference" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "theme" character varying(30) NOT NULL DEFAULT 'LIGHT', "brightness" smallint NOT NULL DEFAULT '100', "fontFamily" character varying(30) NOT NULL DEFAULT 'arial', "fontSize" character varying(3) NOT NULL DEFAULT 'md', "lineSpacing" numeric(2,1) NOT NULL DEFAULT '1.5', "letterSpacing" numeric(3,2) NOT NULL DEFAULT '0.01', "cursorSize" character varying(2) NOT NULL DEFAULT 'md', "cursorColor" character varying(6) NOT NULL DEFAULT 'F7C8D4', CONSTRAINT "CHK_6b6087d2b8a4739f4e2d99a11a" CHECK (UPPER("cursorColor") IN ('F7C8D4', 'A7C7E7', 'A8E6CF', 'C9A7E4', 'F5C6A5', 'F8E79D')), CONSTRAINT "CHK_2cf64bd1c73ca394a72f722a51" CHECK (LOWER("cursorSize") IN ('sm', 'md', 'lg')), CONSTRAINT "CHK_260ad515c220486fb6068fe6a6" CHECK ("letterSpacing" >= 0.01 AND "letterSpacing" <= 0.2), CONSTRAINT "CHK_512c79e6936b319e8bca9942c0" CHECK ("lineSpacing" >= 1.5 AND "lineSpacing" <= 3), CONSTRAINT "CHK_8e00793fb338f4577406cccec1" CHECK (LOWER("fontSize") IN ('sm', 'md', 'lg', 'xlg')), CONSTRAINT "CHK_1c698f71d5ebf3ba37cd10565d" CHECK (LOWER("fontFamily") IN ('arial', 'calibri', 'helvetica', 'tahoma', 'times new roman', 'verdana')), CONSTRAINT "CHK_c6bd0892246cb2e435b1ea1e9c" CHECK (brightness >= 0 AND brightness <= 100), CONSTRAINT "CHK_cd655cfeb40c4540139e3abcc2" CHECK (UPPER("theme") IN ('LIGHT', 'DARK')), CONSTRAINT "PK_5c4cbf49a1e97dcbc695bf462a6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "guideline" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "guideline" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "guideline" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "guideline" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "guideline" DROP COLUMN "deletedAt"`);
    await queryRunner.query(
      `ALTER TABLE "guideline" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "username"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "username" character varying(25)`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deletedAt"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth" DROP COLUMN "verificationTokenExpiry"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth" ADD "verificationTokenExpiry" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth" DROP COLUMN "smsVerificationCodeExpiry"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth" ADD "smsVerificationCodeExpiry" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "auth" DROP COLUMN "deletedAt"`);
    await queryRunner.query(
      `ALTER TABLE "auth" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "project" ADD "name" character varying(100) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "project" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "project" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "deletedAt"`);
    await queryRunner.query(
      `ALTER TABLE "project" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "guideline" ADD CONSTRAINT "CHK_a361be4ca6bed2ec03affe2f30" CHECK (UPPER("statusCode") IN ('STANDBY', 'APPROVED', 'PENDING', 'REJECTED'))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "CHK_faed6256b3c9c55eb01855f630" CHECK ("username" ~ '^[A-Za-z0-9]+([A-Za-z0-9]+)*$')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "CHK_faed6256b3c9c55eb01855f630"`,
    );
    await queryRunner.query(
      `ALTER TABLE "guideline" DROP CONSTRAINT "CHK_a361be4ca6bed2ec03affe2f30"`,
    );
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "project" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "project" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "project" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "project" ADD "name" character varying(150) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "auth" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "auth" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "auth" DROP COLUMN "smsVerificationCodeExpiry"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth" ADD "smsVerificationCodeExpiry" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth" DROP COLUMN "verificationTokenExpiry"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth" ADD "verificationTokenExpiry" TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "username"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "username" character varying(30)`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "guideline" DROP COLUMN "deletedAt"`);
    await queryRunner.query(
      `ALTER TABLE "guideline" ADD "deletedAt" TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE "guideline" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "guideline" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "guideline" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "guideline" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`DROP TABLE "preference"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "CHK_6554a78eec89265385de2ebc17" CHECK (((username)::text ~ '^[A-Za-z0-9]+( [A-Za-z0-9]+)*$'::text))`,
    );
    await queryRunner.query(
      `ALTER TABLE "guideline" ADD CONSTRAINT "CHK_1d85d193ca74fc1416809e72e4" CHECK ((upper(("statusCode")::text) = ANY (ARRAY['APPROVED'::text, 'PENDING'::text, 'REJECTED'::text, 'DELETED'::text])))`,
    );
  }
}
