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
        await this.runJob();
        success = true;
        this.logger.debug(`Job succeeded on attempt ${attempt}`);
      } catch (error) {
        this.logger.error(`Attempt ${attempt} failed: ${error}`);
      }
    }

    if (attempt == MAX_ATTEMPTS) {
      this.logger.error('Max retry attempts reached. Job failed.');
    }
  }

  private async runJob() {
    this.logger.debug('Running the job logic...');

    const res = await fetch(
      'https://acessiweb-backend-w5eh.onrender.com/guidelines?limit=1&offset=0',
    );

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data = await res.json();
    return data;
  }
}
