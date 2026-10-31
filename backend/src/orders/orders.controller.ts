import { Controller, Get, Post, Body, Patch, Param, Delete, Headers, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderDto } from './dto/update-order.dto.js';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll(@Headers('authorization') authorization?: string) {
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
    if (!token) throw new UnauthorizedException('Authentication required');
    try {
      const decoded = this.jwtService.verify(token);
      if (decoded.role !== 'ADMIN' && decoded.role !== 'SUPER_ADMIN') {
        throw new ForbiddenException('Admin access required to view global order ledger');
      }
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return this.ordersService.findAll();
  }

  @Get('seller/:sellerId')
  findBySeller(@Param('sellerId') sellerId: string) {
    return this.ordersService.findBySeller(sellerId);
  }

  @Get('buyer/:buyerId')
  async findByBuyer(
    @Param('buyerId') buyerId: string,
    @Headers('authorization') authorization?: string,
  ) {
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : undefined;
    if (!token) throw new UnauthorizedException('Authentication required');

    let decoded: any;
    try {
      decoded = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired session');
    }

    const authenticatedUserId = decoded.sub || decoded.id;
    const targetId = (buyerId === 'me' || !buyerId) ? authenticatedUserId : buyerId;

    if (authenticatedUserId !== targetId && decoded.role !== 'ADMIN' && decoded.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Access denied');
    }

    return this.ordersService.findByBuyer(targetId, [
      decoded.phone,
      decoded.email,
      decoded.markatId,
    ].filter(Boolean));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('authorization') authorization?: string) {
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
    if (!token) throw new UnauthorizedException('Authentication required');
    try {
      const decoded = this.jwtService.verify(token);
      if (decoded.role !== 'ADMIN' && decoded.role !== 'SUPER_ADMIN') {
        throw new ForbiddenException('Admin privileges required to delete orders');
      }
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return this.ordersService.remove(id);
  }
}
