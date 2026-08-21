import { Module } from '@nestjs/common';
import { StripePaymentService } from './stripe-payment.service';
import { StripePaymentController } from './stripe-payment.controller';
import { BadgeService } from '../badge/badge.service';
import { StorageService } from 'src/common/services/storage.service';
import { VacanzaProtectModule } from '../vacanza-protect/vacanza-protect.module';

@Module({
  imports: [VacanzaProtectModule],
  controllers: [StripePaymentController],
  providers: [StripePaymentService,BadgeService, StorageService],
})
export class StripePaymentModule {}
