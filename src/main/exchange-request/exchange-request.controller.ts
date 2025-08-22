import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { ExchangeRequestService } from './exchange-request.service';
import { CreateExchangeRequestDto } from './dto/create-exchange-request.dto';
import { UpdateExchangeRequestDto } from './dto/update-exchange-request.dto';

@ApiTags('Exchange Requests')
@Controller('exchange-request')
export class ExchangeRequestController {
  constructor(
    private readonly exchangeRequestService: ExchangeRequestService,
  ) {}

  /** CREATE */
  @Post()
  @ApiOperation({ summary: 'Create a new exchange request' })
  @ApiBody({ type: CreateExchangeRequestDto })
  @ApiResponse({ status: 201, description: 'Exchange request created successfully' })
  create(@Body() createExchangeRequestDto: CreateExchangeRequestDto) {
    return this.exchangeRequestService.create(createExchangeRequestDto);
  }

  /** GET ALL */
  @Get()
  @ApiOperation({ summary: 'Get all exchange requests' })
  @ApiResponse({ status: 200, description: 'List of exchange requests' })
  findAll() {
    return this.exchangeRequestService.findAll();
  }

  /** GET ONE */
  @Get(':id')
  @ApiOperation({ summary: 'Get an exchange request by ID' })
  @ApiParam({ name: 'id', description: 'Exchange request UUID' })
  @ApiResponse({ status: 200, description: 'Exchange request found' })
  @ApiResponse({ status: 404, description: 'Exchange request not found' })
  findOne(@Param('id') id: string) {
    return this.exchangeRequestService.findOne(id);
  }

  /** UPDATE */
  @Patch(':id')
  @ApiOperation({ summary: 'Update an exchange request by ID' })
  @ApiParam({ name: 'id', description: 'Exchange request UUID' })
  @ApiBody({ type: UpdateExchangeRequestDto })
  @ApiResponse({ status: 200, description: 'Exchange request updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateExchangeRequestDto: UpdateExchangeRequestDto,
  ) {
    return this.exchangeRequestService.update(id, updateExchangeRequestDto);
  }

  /** DELETE */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an exchange request by ID' })
  @ApiParam({ name: 'id', description: 'Exchange request UUID' })
  @ApiResponse({ status: 200, description: 'Exchange request deleted successfully' })
  @ApiResponse({ status: 404, description: 'Exchange request not found' })
  remove(@Param('id') id: string) {
    return this.exchangeRequestService.remove(id);
  }
}
