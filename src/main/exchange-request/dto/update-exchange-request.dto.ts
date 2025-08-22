import { PartialType } from '@nestjs/swagger';
import { CreateExchangeRequestDto } from './create-exchange-request.dto';

export class UpdateExchangeRequestDto extends PartialType(CreateExchangeRequestDto) {}
