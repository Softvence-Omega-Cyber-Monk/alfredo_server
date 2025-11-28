import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserRoleDto } from './dto/updateAdmin.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/authorization/roles.guard';
import { Roles } from '../auth/authorization/roles.decorator';
import { Role } from '../auth/authorization/roleEnum';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { GiveBadgeDto } from './dto/badge.dto';
import { IdentificationType, Language, PropertyType, TravelGroup } from '@prisma/client';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Get logged-in user's profile
  @Get('my-profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMe(@CurrentUser('id') userId: string) {
    return this.userService.getUser(userId);
  }


  // Get all users
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

 @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photo: { type: 'string', format: 'binary' }, // file input
        fullName: { type: 'string' },
        phoneNumber: { type: 'string' ,example:"0440958458 "},
        city: { type: 'string' },
        age: { type: 'string' },
        dateOfBirth: { type: 'string', format: 'date-time' },
        identification: { type: 'string', enum: Object.values(IdentificationType) },
        languagePreference: { type: 'string', enum: Object.values(Language) },
        homeAddress: { type: 'string' },
        travelType: { type: 'array', items: { type: 'string' } },
        travelMostlyWith:{type:'string',enum:Object.values(TravelGroup)},
        favoriteDestinations: { type: 'array', items: { type: 'string' } },
        isTravelWithPets: { type: 'boolean' },
        notes: { type: 'string' },
        homeDescription: { type: 'string' },
        aboutNeighborhood: { type: 'string' },
        isAvailableForExchange: { type: 'boolean' },
        availabilityStartDate: { type: 'string', format: 'date-time' },
        availabilityEndDate: { type: 'string', format: 'date-time' },
        maxPeople: { type: 'number' },
        propertyType: { type: 'string', enum: Object.values(PropertyType) },
        isMainResidence: { type: 'boolean' },
        homeName: { type: 'string' },
      },
    },
  })
  updateMe(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.userService.updateMe(userId, dto, file);
  }

  // Get single user
@Get('/:id')
getSingleUser(@Param('id') userId: string) {
  return this.userService.getUser(userId);
}

  // Delete logged-in user
  @Delete('delete/:id')
  deleteUser(@Param('id') id:string) {
    try{
      return this.userService.deleteUser(id);
    }catch(error){
      throw new InternalServerErrorException(error.message,error.status)
    }
  }

  // Update user role (admin only)
  @Patch('update/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin,Role.SuperAdmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a user role by ID' })
  @ApiParam({
    name: 'id',
    description: 'User ID to update',
    type: 'string',
    example: '634f8b8b8b8b8b8b8b8b8b8b',
  })
  @ApiBody({
    type: UpdateUserRoleDto,
    description: 'Only the role can be updated',
  })
  updateUserRole(
    @CurrentUser('id') currentUserId: string, // authenticated user
    @Param('id') id: string, // target user id to update
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.userService.updateUserRole(id, dto.role);
  }

//*give badge to user
@Patch('give-badge/:id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
@ApiBearerAuth()
@ApiBody({ type: GiveBadgeDto })
giveBadgeToUser(
  @Param('id') id: string,
  @Body() dto: GiveBadgeDto,
) {
  try {
    return this.userService.giveBadgesToUser(id, dto.badgetype);
  } catch (error) {
    throw new InternalServerErrorException(error.message);
  }
}


}
