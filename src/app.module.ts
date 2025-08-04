import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './main/prisma/prisma.service';
import { PrismaModule } from './main/prisma/prisma.module';
import { AuthModule } from './main/auth/auth.module';
import { MailService } from './main/mail/mail.service';
import { ContactModule } from './main/contact/contact.module';
import { FAQModule } from './main/faq/faq.module';
import { TermsModule } from './main/terms/terms.module';
import { PlanModule } from './main/plan/plan.module';
import { SubscriptionModule } from './main/subscription/subscription.module';
import { UserModule } from './main/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { TwilioService } from './main/twilio/twilio.service';
import { TwilioModule } from './main/twilio/twilio.module';
import { ChatModule } from './main/chat/chat.module';
import { ArticleModule } from './main/article/article.module';
import { OnboardingModule } from './main/onboarding/onboarding.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes .env available app-wide
    }),
    PrismaModule,
    AuthModule, 
    ContactModule,
    FAQModule,
    TermsModule,
    PlanModule,
    SubscriptionModule,
    UserModule,
    TwilioModule,
    ChatModule,
    ArticleModule,
    OnboardingModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, MailService, TwilioService],
})
export class AppModule {}
