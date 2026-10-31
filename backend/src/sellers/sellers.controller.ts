import { Controller, Get, Post, Body, Patch, Param, Delete, Headers, Query, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { SellersService } from './sellers.service.js';
import { JwtService } from '@nestjs/jwt';

@Controller('sellers')
export class SellersController {
  constructor(
    private readonly sellersService: SellersService,
    private readonly jwtService: JwtService,
  ) {}

  private verifyAdmin(authHeader?: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication token required');
    }
    try {
      const token = authHeader.replace('Bearer ', '');
      const decoded = this.jwtService.verify(token);
      if (decoded.role !== 'ADMIN' && decoded.role !== 'SUPER_ADMIN') {
        throw new ForbiddenException('Admin privileges required');
      }
      return decoded;
    } catch {
      throw new UnauthorizedException('Invalid or expired admin session');
    }
  }

  private verifyUserOrAdmin(userId: string, authHeader?: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication token required');
    }
    try {
      const token = authHeader.replace('Bearer ', '');
      const decoded = this.jwtService.verify(token);
      const isOwner = decoded.sub === userId || decoded.id === userId;
      const isAdmin = decoded.role === 'ADMIN' || decoded.role === 'SUPER_ADMIN';
      if (!isOwner && !isAdmin) {
        throw new ForbiddenException('Access denied');
      }
      return decoded;
    } catch {
      throw new UnauthorizedException('Invalid or expired session');
    }
  }


  @Get('gst-reports')
  getGstReport(
    @Query('sellerId') sellerId?: string,
    @Query('month') month?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    let extractedUserId: string | undefined = sellerId;
    if (!extractedUserId && authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const payload = this.jwtService.verify(token);
        extractedUserId = payload.sub;
      } catch {}
    }
    return this.sellersService.getSellerGstReport(extractedUserId, month);
  }

  @Post('gst-reports/send-ca')
  sendCaReport(
    @Body() body: { sellerId?: string; month: string; caEmail: string; caName: string; notes?: string },
    @Headers('authorization') authHeader?: string,
  ) {
    let extractedUserId: string = body.sellerId || '';
    if (!extractedUserId && authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const payload = this.jwtService.verify(token);
        extractedUserId = payload.sub;
      } catch {}
    }
    return this.sellersService.sendCaGstReport(extractedUserId, body);
  }


  @Post()
  create(@Body() createSellerDto: any, @Headers('authorization') authHeader?: string) {
    let userId: string | undefined;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const payload = this.jwtService.verify(token);
        userId = payload.sub;
      } catch {}
    }
    return this.sellersService.create(createSellerDto, userId);
  }

  @Get()
  findAll() {
    return this.sellersService.findAll();
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Headers('authorization') authHeader?: string,
    @Body('kycCallStatus') kycCallStatus?: string,
    @Body('kycNotes') kycNotes?: string,
  ) {
    this.verifyAdmin(authHeader);
    return this.sellersService.updateStatus(id, status, { kycCallStatus, kycNotes });
  }

  @Patch(':id/kyc')
  updateKyc(
    @Param('id') id: string,
    @Body() body: { kycCallStatus?: string; kycNotes?: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.verifyAdmin(authHeader);
    return this.sellersService.updateKyc(id, body);
  }

  @Patch(':id/registration-fee')
  updateRegistrationFee(
    @Param('id') id: string,
    @Body() body: { registrationFeePaid?: boolean; registrationFeeAmount?: number; registrationFeeStatus?: string; registrationPaymentId?: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.verifyAdmin(authHeader);
    return this.sellersService.updateRegistrationFee(id, body);
  }

  @Patch('user/:userId')
  updateUser(@Param('userId') userId: string, @Body() data: any, @Headers('authorization') authHeader?: string) {
    this.verifyUserOrAdmin(userId, authHeader);
    return this.sellersService.updateUser(userId, data);
  }

  @Delete('user/:userId')
  removeUser(@Param('userId') userId: string, @Headers('authorization') authHeader?: string) {
    this.verifyUserOrAdmin(userId, authHeader);
    return this.sellersService.removeUser(userId);
  }
}
