import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Libera o frontend Next.js
  app.enableCors({
    origin: 'http://localhost:3001', // <- o seu front
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  console.log('✅ CORS habilitado para http://localhost:3001');

  await app.listen(3000);
}
bootstrap();
