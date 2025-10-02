import { Pool } from 'pg';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class DatabasePool {
  private readonly pool: Pool;
  private readonly logger = new Logger(DatabasePool.name);

  constructor() {
    this.pool = new Pool({
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
      ssl: { rejectUnauthorized: false },
    });

    this.pool.on('error', (err) => {
      this.logger.error('Pool connection error', err);
    });
  }

  async query(text: string, params?: any[]) {
    try {
      return await this.pool.query(text, params);
    } catch (err) {
      this.logger.warn('Query failed, trying to reconnect...', err);
      await this.reconnect();
      return this.pool.query(text, params);
    }
  }

  private async reconnect() {
    try {
      await this.pool.end();
      this.logger.log('Recreating pool...');
      this.pool.connect();
      this.logger.log('Pool reconnected!');
    } catch (err) {
      this.logger.error('Error trying to recreate pool', err);
    }
  }
}
