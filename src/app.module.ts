import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DeficiencesModule } from './domains/deficiences/deficiences.module';
import { GuidelinesModule } from './domains/guidelines/guidelines.module';
import { ProjectsModule } from './domains/projects/projects.module';
import { UsersModule } from './domains/users/users.module';
import { ImageKitModule } from './integrations/imagekit/imagekit.module';
import { AdminUserModule } from './domains/users/admin-users/admin-users.module';
import { CommonUserModule } from './domains/users/common-users/common-users.module';
import { GuidelinesRequestsModule } from './domains/guidelines-requests/guidelines-requests.module';

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
    UsersModule,
    ImageKitModule,
    AdminUserModule,
    GuidelinesRequestsModule,
  ],
})
export class AppModule {}
