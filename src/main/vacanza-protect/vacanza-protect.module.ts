import { Module } from '@nestjs/common';
import { VacanzaProtectService } from './vacanza-protect.service';
import { VacanzaProtectController } from './vacanza-protect.controller';

@Module({
  controllers: [VacanzaProtectController],
  providers: [VacanzaProtectService],
  exports: [VacanzaProtectService],
})
export class VacanzaProtectModule {}
