import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  HttpStatus,
  HttpException,
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

  // crete plan by admin
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.Admin)
  @Post()
  async create(@Body() createPlanDto: CreatePlanDto) {
    try {
      const res = await this.planService.create(createPlanDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Plan created successfully',
        data: res,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // this is the public route to fetch all plans
  @Get()
  findAll() {
  try{
     const res= this.planService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Plans fetched successfully',
      data: res,
    }
  } catch(err){
    throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);

  }
  }

  // for get the single plan
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const res=await this.planService.findOne(id);
    return{
      statusCode: HttpStatus.OK,
      message: 'Plan fetched successfully',
      data: res
    }
  }

  // for update the plan by admin
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.Admin, Role.SuperAdmin)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    try{
        const res=await this.planService.update(id, updatePlanDto);
    return{
      statusCode: HttpStatus.OK,
      message: 'Plan updated successfully',
      data: res
    }
    }catch(err){
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  // for delete the plan by admin
  @UseGuards(JwtAuthGuard,RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.Admin)
  @Delete(':id')
  async  remove(@Param('id') id: string) {
   try{
     const res=await this.planService.remove(id);
    return{
      statusCode: HttpStatus.OK,
      message: 'Plan deleted successfully',
      data: res
    
    }
  }catch(err){
    throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR)
  }
   }
}
