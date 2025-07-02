import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1751419268272 implements MigrationInterface {
    name = 'InitialSchema1751419268272'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "deficiency" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "UQ_b6890c4105fec5b226fde7af4f0" UNIQUE ("name"), CONSTRAINT "CHK_35937da6e6c329f3340838bba7" CHECK (LOWER("name") IN ('visual', 'auditiva', 'cognitiva e neural', 'motora', 'tea')), CONSTRAINT "PK_6e3973239ec280ea528aebe4407" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "guideline" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(150) NOT NULL, "description" text NOT NULL, "code" text, "image" character varying(500), "imageId" character varying, "imageDesc" character varying(250), "statusCode" character varying(10) NOT NULL, "statusMsg" text, "isRequest" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" uuid, CONSTRAINT "UQ_767b8539b97171eaebfd103942c" UNIQUE ("name"), CONSTRAINT "CHK_1d85d193ca74fc1416809e72e4" CHECK (UPPER("statusCode") IN ('APPROVED', 'PENDING', 'REJECTED', 'DELETED')), CONSTRAINT "PK_8c57320ee4904d6b23c0af65069" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "username" character varying(30), "deletedAt" TIMESTAMP, CONSTRAINT "CHK_6554a78eec89265385de2ebc17" CHECK ("username" ~ '^[A-Za-z0-9]+( [A-Za-z0-9]+)*$'), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6620cd026ee2b231beac7cfe57" ON "user" ("role") `);
        await queryRunner.query(`CREATE TABLE "project" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(150) NOT NULL, "description" text, "feedback" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" uuid, CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "guideline_deficiences_deficiency" ("guidelineId" uuid NOT NULL, "deficiencyId" uuid NOT NULL, CONSTRAINT "PK_601e376344697261555b36c5b5f" PRIMARY KEY ("guidelineId", "deficiencyId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_32111d37df9aefdf832b29127e" ON "guideline_deficiences_deficiency" ("guidelineId") `);
        await queryRunner.query(`CREATE INDEX "IDX_16bff06ed0958840a93e708917" ON "guideline_deficiences_deficiency" ("deficiencyId") `);
        await queryRunner.query(`CREATE TABLE "project_guidelines_guideline" ("projectId" uuid NOT NULL, "guidelineId" uuid NOT NULL, CONSTRAINT "PK_2c9f2ee1eb781c21cf079bb1e73" PRIMARY KEY ("projectId", "guidelineId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8f7c441a78ded279b9d372bc78" ON "project_guidelines_guideline" ("projectId") `);
        await queryRunner.query(`CREATE INDEX "IDX_f6dfc6e2f89cff378e0023d1d9" ON "project_guidelines_guideline" ("guidelineId") `);
        await queryRunner.query(`ALTER TABLE "guideline" ADD CONSTRAINT "FK_8399b4fae17160677d9bb1222cb" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "project" ADD CONSTRAINT "FK_7c4b0d3b77eaf26f8b4da879e63" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "guideline_deficiences_deficiency" ADD CONSTRAINT "FK_32111d37df9aefdf832b29127ee" FOREIGN KEY ("guidelineId") REFERENCES "guideline"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "guideline_deficiences_deficiency" ADD CONSTRAINT "FK_16bff06ed0958840a93e708917c" FOREIGN KEY ("deficiencyId") REFERENCES "deficiency"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "project_guidelines_guideline" ADD CONSTRAINT "FK_8f7c441a78ded279b9d372bc783" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "project_guidelines_guideline" ADD CONSTRAINT "FK_f6dfc6e2f89cff378e0023d1d97" FOREIGN KEY ("guidelineId") REFERENCES "guideline"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project_guidelines_guideline" DROP CONSTRAINT "FK_f6dfc6e2f89cff378e0023d1d97"`);
        await queryRunner.query(`ALTER TABLE "project_guidelines_guideline" DROP CONSTRAINT "FK_8f7c441a78ded279b9d372bc783"`);
        await queryRunner.query(`ALTER TABLE "guideline_deficiences_deficiency" DROP CONSTRAINT "FK_16bff06ed0958840a93e708917c"`);
        await queryRunner.query(`ALTER TABLE "guideline_deficiences_deficiency" DROP CONSTRAINT "FK_32111d37df9aefdf832b29127ee"`);
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "FK_7c4b0d3b77eaf26f8b4da879e63"`);
        await queryRunner.query(`ALTER TABLE "guideline" DROP CONSTRAINT "FK_8399b4fae17160677d9bb1222cb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f6dfc6e2f89cff378e0023d1d9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8f7c441a78ded279b9d372bc78"`);
        await queryRunner.query(`DROP TABLE "project_guidelines_guideline"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_16bff06ed0958840a93e708917"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_32111d37df9aefdf832b29127e"`);
        await queryRunner.query(`DROP TABLE "guideline_deficiences_deficiency"`);
        await queryRunner.query(`DROP TABLE "project"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6620cd026ee2b231beac7cfe57"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "guideline"`);
        await queryRunner.query(`DROP TABLE "deficiency"`);
    }

}
