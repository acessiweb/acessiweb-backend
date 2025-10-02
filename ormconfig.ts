import * as dotenv from 'dotenv';
import { AdminUser } from 'src/domains/users/admin-users/entities/admin-user.entity';
import { Auth } from 'src/services/auth/entities/auth.entity';
import { Deficiency } from 'src/domains/deficiences/entities/deficiences.entity';
import { Guideline } from 'src/domains/guidelines/entities/guideline.entity';
import { Project } from 'src/domains/projects/entities/project.entity';
import { User } from 'src/domains/users/entities/user.entity';
import { DataSource } from 'typeorm';
import { CommonUser } from 'src/domains/users/common-users/entities/common-user.entity';
import { Preference } from 'src/domains/preferences/entities/preference.entity';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT!, 10),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [
    Guideline,
    Deficiency,
    Project,
    User,
    CommonUser,
    Auth,
    AdminUser,
    Preference,
  ],
  migrations: [__dirname + '/src/database/migrations/**/*{.ts,.js}'],
  ssl: { rejectUnauthorized: false },
  synchronize: false,
  logging: true,
});

export default AppDataSource;
