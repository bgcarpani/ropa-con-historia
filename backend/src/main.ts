import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:5173').split(',');
  app.enableCors({ origin: allowedOrigins, credentials: true });
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Backend running on port ${port}`);
}
bootstrap();
