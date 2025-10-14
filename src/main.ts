import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cors from 'cors';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Security middleware
  app.use(helmet());
  app.use(compression());
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? false : true,
    credentials: true,
  }));

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger configuration (development only)
  if (process.env.NODE_ENV === 'development') {
    const config = new DocumentBuilder()
      .setTitle('SV Conta API')
      .setDescription('SV Conta Desktop Application REST API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Authentication', 'Admin authentication endpoints')
      .addTag('Versions', 'Application version management')
      .addTag('Licenses', 'License management and validation')
      .addTag('Analytics', 'Usage analytics and tracking')
      .addTag('Health', 'System health monitoring')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'SV Conta API Documentation',
      customCss: '.swagger-ui .topbar { display: none }',
    });

    logger.log(`Swagger documentation available at: http://localhost:${process.env.PORT || 3000}/api/docs`);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  logger.log(`SV Conta API is running on: http://localhost:${port}`);
  logger.log(`Environment: ${process.env.NODE_ENV}`);
}

bootstrap();