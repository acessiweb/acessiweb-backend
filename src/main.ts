import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationExceptionFilter } from './filters/validation-exception.filter';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import 'module-alias/register';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (ValidationErrors: ValidationError[]) => {
        return new BadRequestException(ValidationErrors);
      },
    }),
  );
  app.useGlobalFilters(new ValidationExceptionFilter());
  const server = await app.listen(8080);
  console.log('Rodando na porta', (server.address() as any).port);
}

bootstrap();
