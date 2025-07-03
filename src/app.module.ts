import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommonUserModule } from './common-users/common-users.module';
import { DeficiencesModule } from './deficiences/deficiences.module';
import { GuidelinesModule } from './guidelines/guidelines.module';
import { ProjectsModule } from './projects/projects.module';
import { CommonUsersProjectsModule } from './common-users/common-users-projects.module';
import { UsersModule } from './users/users.module';
import { UsersGuidelinesModule } from './users/users-guidelines.module';
import { ImageKitModule } from './imagekit/imagekit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: false, // true = shouldn't be used in production - otherwise you can lose production data
      }),
      inject: [ConfigService],
    }),
    CommonUserModule,
    DeficiencesModule,
    GuidelinesModule,
    ProjectsModule,
    CommonUsersProjectsModule,
    UsersModule,
    UsersGuidelinesModule,
    ImageKitModule,
  ],
})
export class AppModule {}
