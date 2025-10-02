import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.debug('Cron job started (every hour)');

    const MAX_ATTEMPTS = 3;
    let attempt = 0;

    while (attempt < MAX_ATTEMPTS) {
      attempt++;
      try {
        this.logger.debug('Running the job logic...');

        await fetch(`${process.env.BACKEND_URL}/guidelines?limit=1&offset=0`);

        this.logger.debug(`Job succeeded on attempt ${attempt}`);
        break;
      } catch (error) {
        this.logger.error(`Attempt ${attempt} failed: ${error}`);

        if (attempt == MAX_ATTEMPTS) {
          this.logger.error('Max retry attempts reached. Job failed.');
        }
      }
    }

    this.logger.log('Cron job finished execution');
  }
}
