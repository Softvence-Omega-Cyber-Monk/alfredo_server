import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProtectPlanType, ProtectPurchaseStatus } from '@prisma/client';
import { VacanzaProtectService } from './vacanza-protect.service';
import { CreateProtectCheckoutDto } from './dto/create-protect-checkout.dto';
import { UpdateProtectPlanDto } from './dto/update-protect-plan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/authorization/roles.guard';
import { Roles } from '../auth/authorization/roles.decorator';
import { Role } from '../auth/authorization/roleEnum';
import { User } from 'src/common/decorators/user.decorator';

@ApiTags('Vacanza Protect')
@Controller('vacanza-protect')
export class VacanzaProtectController {
  constructor(private readonly protectService: VacanzaProtectService) {}

  @Get('plans')
  async getPlans() {
    const data = await this.protectService.getPlans();
    return {
      status: 200,
      message: 'Vacanza Protect plans fetched successfully',
      data,
    };
  }

  /**
   * Public on purpose: Vacanza Protect is sold standalone, so guests buy with
   * just an email. A bearer token is optional and only links the purchase to an
   * existing account.
   */
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: CreateProtectCheckoutDto })
  @Post('checkout')
  async checkout(@User() user: any, @Body() body: CreateProtectCheckoutDto) {
    const data = await this.protectService.createCheckoutSession(body, user);
    return {
      status: 201,
      message: 'Checkout session created successfully',
      ...data,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async myProtection(@User() user: any) {
    const data = await this.protectService.getMyProtection(user.id);
    return {
      status: 200,
      message: 'Protection status fetched successfully',
      data,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiQuery({ name: 'status', required: false, enum: ProtectPurchaseStatus })
  @ApiQuery({ name: 'planType', required: false, enum: ProtectPlanType })
  @Get('purchases')
  async findAllPurchases(
    @Query('status') status?: ProtectPurchaseStatus,
    @Query('planType') planType?: ProtectPlanType,
  ) {
    const data = await this.protectService.findAllPurchases({
      status,
      planType,
    });
    return {
      status: 200,
      message: 'Vacanza Protect purchases fetched successfully',
      data,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @Get('purchases/:id')
  async findOnePurchase(@Param('id') id: string) {
    const data = await this.protectService.findOnePurchase(id);
    return {
      status: 200,
      message: 'Vacanza Protect purchase fetched successfully',
      data,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiBody({ type: UpdateProtectPlanDto })
  @Patch('plans/:id')
  async updatePlan(
    @Param('id') id: string,
    @Body() body: UpdateProtectPlanDto,
  ) {
    const data = await this.protectService.updatePlan(id, body);
    return {
      status: 200,
      message: 'Vacanza Protect plan updated successfully',
      data,
    };
  }
}
