import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.enableCors({
    origin: ["*","http://localhost:5173", "https://luxury-longma-7b4d22.netlify.app"],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Alfredo Backend System')
    .setDescription('Authentication and necessary endpoints')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // ⚡ Stripe Webhook: raw body middleware
  app.use(
    'stripe-payment/webhook',
    bodyParser.raw({ type: 'application/json' }),
  );

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
