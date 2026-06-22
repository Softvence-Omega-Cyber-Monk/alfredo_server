// alfredo_server/src/main.ts
import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common'; // Add this
import * as bodyParser from 'body-parser';
import 'dotenv/config';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  // Enable CORS
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:4000',
        'http://localhost:5173',
        'https://vacanza-dashboard.vercel.app',
        'https://admin.vacanzagreece.gr',
        'https://admin.vacanzagreece.gr/',
        'https://vacanzagreece.gr',
        'https://vacanzagreece.gr/',
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`CORS blocked for origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type,Accept,Authorization,X-Requested-With',
  });

  // Global API prefix
  app.setGlobalPrefix('api');

  // ✅ Add Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Swagger setup - 🚨 Change path to 'docs' to avoid conflict with 'api'
  const config = new DocumentBuilder()
    .setTitle('Alfredo Backend System')
    .setDescription('Authentication and necessary endpoints.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // Setup on /api/docs to match proxy forwarding

  // Stripe webhook: raw body middleware
  //   app.use(
  //     '/api/stripe-payment/webhook', // Add leading /api if you want it under prefix
  //     bodyParser.raw({ type: 'application/json' }),
  //   );

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  app.set('trust proxy', true);

  const port = process.env.PORT || 8000;
  console.log(`Backend is running on: http://localhost:${port}`);
  await app.listen(port);
}
bootstrap();