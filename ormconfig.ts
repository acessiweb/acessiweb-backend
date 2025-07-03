import * as dotenv from 'dotenv';
import { AdminUser } from 'src/admin-users/entities/admin-user.entity';
import { Auth } from 'src/auth/entities/auth.entity';
import { CommonUser } from 'src/common-users/entities/common-user.entity';
import { Deficiency } from 'src/deficiences/entities/deficiences.entity';
import { Guideline } from 'src/guidelines/entities/guideline.entity';
import { Project } from 'src/projects/entities/project.entity';
import { User } from 'src/users/entities/user.entity';
import { DataSource } from 'typeorm';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT!, 10),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [Guideline, Deficiency, Project, User, CommonUser, Auth, AdminUser],
  migrations: [__dirname + '/src/migrations/**/*{.ts,.js}'],
  synchronize: false,
  logging: true,
});

export default AppDataSource;
