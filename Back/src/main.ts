import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger();
  const PORT = process.env.PORT || 3000;

  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.APP_ENV === 'dev'
        ? ['error', 'warn', 'debug', 'log']
        : ['error', 'warn'],
  });

  if (process.env.APP_ENV === 'dev') {
    const config = new DocumentBuilder()
      .setTitle('Sindico IA API')
      .setDescription('Sindico IA API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
    logger.debug('✅ Swagger documentation is enabled');
  }

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  logger.debug(`✅ CORS enabled for ${process.env.FRONTEND_URL}`);
  logger.debug(`Application is running on: http://localhost:${PORT}`);

  await app.listen(PORT);
}
void bootstrap();
