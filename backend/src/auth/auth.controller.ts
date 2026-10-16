import { Controller, Post, Get, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() data: any, @Headers('authorization') authHeader: string) {
    return this.authService.signup(data, authHeader);
  }

  @Post('login')
  login(@Body() data: any) {
    return this.authService.login(data);
  }

  @Post('phone-login')
  phoneLogin(@Body() data: any) {
    return this.authService.phoneLogin(data.phone);
  }

  @Post('google')
  googleLogin(@Body() data: { token: string; role?: string }) {
    return this.authService.googleLogin(data.token, data.role);
  }

  @Get('me')
  getMe(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }
    const token = authHeader.replace('Bearer ', '');
    return this.authService.getMe(token);
  }

  @Post('forgot-password')
  forgotPassword(@Body('identifier') identifier: string) {
    return this.authService.forgotPassword(identifier);
  }

  @Post('reset-password')
  resetPassword(@Body() data: { identifier: string; code: string; new_password: string }) {
    return this.authService.resetPasswordWithCode(data.identifier, data.code, data.new_password);
  }

  @Post('verify-reset-code')
  verifyResetCode(@Body() data: { identifier: string; code: string }) {
    return this.authService.verifyResetCode(data.identifier, data.code);
  }

  @Post('send-signup-otp')
  sendSignupOtp(@Body() data: { identifier: string; type: string; phone?: string }) {
    return this.authService.sendSignupOtp(data.identifier, data.type, data.phone);
  }

  @Post('verify-signup-otp')
  verifySignupOtp(@Body() data: { identifier: string; code: string; type: string }) {
    return this.authService.verifySignupOtp(data.identifier, data.code, data.type);
  }

  @Post('support-ticket')
  sendSupportTicket(@Body() data: { name?: string; email: string; subject?: string; message: string; phone?: string }) {
    return this.authService.sendSupportTicket(data);
  }
}

