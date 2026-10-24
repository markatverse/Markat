import { Controller, Get, Post, Body, Patch, Param, Delete, Headers } from '@nestjs/common';
import { SellersService } from './sellers.service.js';
import { JwtService } from '@nestjs/jwt';

@Controller('sellers')
export class SellersController {
  constructor(
    private readonly sellersService: SellersService,
    private readonly jwtService: JwtService,
  ) {}

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
    @Body('kycCallStatus') kycCallStatus?: string,
    @Body('kycNotes') kycNotes?: string,
  ) {
    return this.sellersService.updateStatus(id, status, { kycCallStatus, kycNotes });
  }

  @Patch(':id/kyc')
  updateKyc(
    @Param('id') id: string,
    @Body() body: { kycCallStatus?: string; kycNotes?: string },
  ) {
    return this.sellersService.updateKyc(id, body);
  }

  @Patch('user/:userId')
  updateUser(@Param('userId') userId: string, @Body() data: any) {
    return this.sellersService.updateUser(userId, data);
  }

  @Delete('user/:userId')
  removeUser(@Param('userId') userId: string) {
    return this.sellersService.removeUser(userId);
  }
}
