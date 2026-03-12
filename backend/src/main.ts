import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // All routes will be prefixed with /api (e.g. /api/mood)
  app.setGlobalPrefix('api');
  // Allow frontend (e.g. localhost:3000) to call this API
  app.enableCors();
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
