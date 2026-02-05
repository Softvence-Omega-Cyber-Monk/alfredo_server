import { Module } from '@nestjs/common';
import { FeaturedPropertyService } from './featured-property.service';
import { FeaturedPropertyController } from './featured-property.controller';

@Module({
    controllers: [FeaturedPropertyController],
    providers: [FeaturedPropertyService],
    exports: [FeaturedPropertyService],
})
export class FeaturedPropertyModule { }
