import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { TwilioModule } from '../twilio/twilio.module';
import { PrismaService } from '../prisma/prisma.service';
import { JwtStrategy } from './jwt.strategy';
import { MailService } from '../mail/mail.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { OtpService } from './services/otp.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    ConfigModule.forRoot(), // Add this to load environment variables
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    TwilioModule,
  ],
  providers: [
    AuthService,
    PrismaService,
    JwtStrategy,
    MailService,
    JwtAuthGuard,
    OtpService,
    ConfigService, // Add ConfigService to providers
  ],
  controllers: [AuthController],
})
export class AuthModule {}
