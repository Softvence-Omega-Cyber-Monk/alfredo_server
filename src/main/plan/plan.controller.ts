import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/authorization/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '../auth/authorization/roleEnum';
import { Roles } from '../auth/authorization/roles.decorator';


@Controller('plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}


  @UseGuards(JwtAuthGuard)
@ApiBearerAuth()
  @Post()
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.planService.create(createPlanDto);
  }

  @UseGuards(JwtAuthGuard)
@ApiBearerAuth()

  @Get()
  findAll() {
    return this.planService.findAll();
  }

  @UseGuards(JwtAuthGuard)
@ApiBearerAuth()

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planService.findOne(id);
  }

  @UseGuards(JwtAuthGuard,RolesGuard)
@ApiBearerAuth()
@Roles(Role.Admin)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.planService.update(id, updatePlanDto);
  }

  @UseGuards(JwtAuthGuard)
@ApiBearerAuth()

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planService.remove(id);
  }
}
