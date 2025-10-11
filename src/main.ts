import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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
    origin: [
      '*',
      'http://localhost:5173',
      'https://luxury-longma-7b4d22.netlify.app',
      'https://vacanzagreece.gr/',
      'http://localhost:3000',
      'https://vacanza-dashboard.vercel.app',
      'https://admin.vacanzagreece.gr'
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  // Global API prefix
  app.setGlobalPrefix('api');

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Alfredo Backend System')
    .setDescription('Authentication and necessary endpoints')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Stripe webhook: raw body middleware
  app.use(
    'stripe-payment/webhook',
    bodyParser.raw({ type: 'application/json' }),
  );

  // ⚡ Serve uploaded files publicly
  // Access via: http://localhost:8000/uploads/filename.jpg
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  app.set('trust proxy', true); 
  // Start server
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
