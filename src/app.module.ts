import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CommonUserModule } from './common-users/common-users.module';
import { CommonUser } from './common-users/entities/common-user.entity';
import { Guideline } from './guidelines/entities/guideline.entity';
import { Project } from './projects/entities/project.entity';
import { Deficiency } from './deficiences/entities/deficiences.entity';
import { Auth } from './auth/entities/auth.entity';
import { DeficiencesModule } from './deficiences/deficiences.module';
import { GuidelinesModule } from './guidelines/guidelines.module';
import { User } from './users/entities/user.entity';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local'],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: process.env.DB_PASSWORD,
      database: 'acessibiweb',
      synchronize: true, // true = shouldn't be used in production - otherwise you can lose production data
      entities: [User, CommonUser, Guideline, Project, Deficiency, Auth],
    }),
    CommonUserModule,
    DeficiencesModule,
    GuidelinesModule,
    ProjectsModule,
  ],
})
export class AppModule {}
