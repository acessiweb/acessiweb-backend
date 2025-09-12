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
    let success = false;

    while (attempt < MAX_ATTEMPTS && !success) {
      attempt++;
      try {
        this.logger.debug('Running the job logic...');

        await fetch(
          'https://acessiweb-backend-w5eh.onrender.com/guidelines?limit=1&offset=0',
        );

        success = true;
        this.logger.debug(`Job succeeded on attempt ${attempt}`);
      } catch (error) {
        this.logger.error(`Attempt ${attempt} failed: ${error}`);

        if (attempt == MAX_ATTEMPTS) {
          this.logger.error('Max retry attempts reached. Job failed.');
        }
      }
    }
  }
}
