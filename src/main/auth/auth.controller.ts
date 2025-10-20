import { Body, Controller, ForbiddenException, HttpCode, HttpException, HttpStatus, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, SendOtpDto, VerifyOtpDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from 'src/common/guard/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

 @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: any,
  ) {
    const ipAddress = req.ip || req.header('x-forwarded-for')?.split(',')[0] || 'Unknown';
    return this.authService.login(dto, ipAddress);
  }

   @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req) {
    const userId = req.user.id;
    const sessionToken = req.user.sessionToken;
    await this.authService.logout(userId, sessionToken);
    
    return { message: 'Successfully logged out.' };
  }
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    // ✅ Use `sub` instead of `id`
    return this.authService.changePassword(req.user.sub, dto);
  }

  @Post('send-otp')
  @ApiOperation({ summary: 'Send OTP via email or phone' })
  sendOtp(@Body() body: SendOtpDto) {
    return this.authService.sendOtp(body.userId, body.method);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify user OTP' })
  verifyOtp(@Body() body: VerifyOtpDto) {
    return this.authService.verifyOtp(body.userId, body.otp);
  }

  @Post('resend-otp')
  @ApiOperation({ summary: 'Resend OTP (after 60s)' })
  resendOtp(@Body() body: SendOtpDto) {
    return this.authService.resendOtp(body.userId, body.method);
  }


  @Post('super-admin')
  @ApiOperation({ summary: 'Create super admin' })
  async createSuperAdmin() {
   try{
 const res=await this.authService.createSuperAdmin();
    return{
      statusCode:HttpStatus.CREATED,
      message:'Super admin created successfully',
      data:res
    }
   }catch(error){
      throw new HttpException(error.message,HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }


   @Post('reset-sessions-and-suspension')
  async resetSessions(@Body() dto:LoginDto) { 
    const user = await this.authService.validateUserCredentials(dto.email,dto.password);

    if (!user) {
        throw new ForbiddenException('Invalid credentials.');
    }

    await this.authService.terminateAllSessions(user.id);

    return { 
        message: 'All your active sessions have been terminated, and your account has been unsuspended. Please proceed to log in now.',
    };
  }


  
}

