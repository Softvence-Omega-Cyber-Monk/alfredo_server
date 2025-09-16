import { PartialType } from '@nestjs/swagger';
import { CreateWebSubscribeDto } from './create-web-subscribe.dto';

export class UpdateWebSubscribeDto extends PartialType(CreateWebSubscribeDto) {}
