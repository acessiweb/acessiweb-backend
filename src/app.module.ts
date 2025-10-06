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
import { AuthModule } from './services/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT') || 5432,
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: false, // true = shouldn't be used in production - otherwise you can lose production data
        ssl:
          configService.get<string>('EMULATOR') === 'true'
            ? false
            : { rejectUnauthorized: false },
        extra: {
          max: 10,
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 10000,
          family: 4,
        },
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
    AuthModule,
  ],
})
export class AppModule {}
