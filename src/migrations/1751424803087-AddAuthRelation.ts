import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuthRelation1751424803087 implements MigrationInterface {
    name = 'AddAuthRelation1751424803087'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "auth" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(512), "emailHash" bytea, "isEmailVerified" boolean, "verificationToken" character varying, "verificationTokenExpiry" TIMESTAMP, "emailVerificationAttempts" integer NOT NULL DEFAULT '0', "mobilePhone" character varying(64), "mobilePhoneHash" bytea, "isMobilePhoneVerified" boolean, "smsVerificationCode" character varying, "smsVerificationCodeExpiry" TIMESTAMP, "smsVerificationAttempts" integer NOT NULL DEFAULT '0', "password" bytea, "deletedAt" TIMESTAMP, "userId" uuid, CONSTRAINT "UQ_3ee9477895f6a3f5e2b7a468c8b" UNIQUE ("emailHash"), CONSTRAINT "UQ_6db77456bc45454777a936cec1b" UNIQUE ("verificationToken"), CONSTRAINT "UQ_a43949420051e038927f85567db" UNIQUE ("mobilePhoneHash"), CONSTRAINT "UQ_3f9f6c9c71eaed69979b5df1cae" UNIQUE ("smsVerificationCode"), CONSTRAINT "REL_373ead146f110f04dad6084815" UNIQUE ("userId"), CONSTRAINT "PK_7e416cf6172bc5aec04244f6459" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "auth" ADD CONSTRAINT "FK_373ead146f110f04dad60848154" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auth" DROP CONSTRAINT "FK_373ead146f110f04dad60848154"`);
        await queryRunner.query(`DROP TABLE "auth"`);
    }

}
