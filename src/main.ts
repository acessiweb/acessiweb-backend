import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import 'module-alias/register';
import { CustomExceptionFilter } from './common/filters/custom-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000'], // allowed origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (ValidationErrors: ValidationError[]) => {
        return new BadRequestException(ValidationErrors);
      },
    }),
  );
  app.useGlobalFilters(
    new ValidationExceptionFilter(),
    new CustomExceptionFilter(),
  );
  const server = await app.listen(process.env.PORT || 8080);
  console.log('Rodando na porta', (server.address() as any).port);
}

bootstrap();
