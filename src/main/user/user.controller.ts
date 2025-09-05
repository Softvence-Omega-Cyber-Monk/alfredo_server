import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Delete,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/updateAdmin.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/authorization/roles.guard';
import { Roles } from '../auth/authorization/roles.decorator';
import { Role } from '../auth/authorization/roleEnum';

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
  @ApiBody({type:UpdateUserDto
  })
  updateMe(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log(dto)
    return this.userService.updateMe(userId, dto, file);
  }

  // Delete logged-in user
  @Delete('delete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deleteUser(@CurrentUser('id') userId: string) {
    return this.userService.deleteUser(userId);
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
}
