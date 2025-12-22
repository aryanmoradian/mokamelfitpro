
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Enable CORS for Frontend access
  app.useGlobalPipes(new ValidationPipe());
  // Listen on 0.0.0.0 to accept connections from other containers/host
  await app.listen(3000, '0.0.0.0');
  console.log('FitPro Backend running on port 3000');
}
bootstrap();
