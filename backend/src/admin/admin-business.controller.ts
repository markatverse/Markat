import { Controller, Get, Post, Patch, Delete, Param, Body, Headers, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminBusinessService } from './admin-business.service.js';

@Controller('admin/businesses')
export class AdminBusinessController {
  constructor(
    private readonly adminBusinessService: AdminBusinessService,
    private readonly jwtService: JwtService,
  ) {}

  private verifyAdmin(authHeader?: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Admin authentication required');
    }
    try {
      const token = authHeader.replace('Bearer ', '');
      const decoded = this.jwtService.verify(token);
      if (decoded.role !== 'ADMIN' && decoded.role !== 'SUPER_ADMIN') {
        throw new ForbiddenException('Admin access required');
      }
      return decoded;
    } catch {
      throw new UnauthorizedException('Invalid or expired admin session');
    }
  }

  @Get()
  getAllBusinesses(@Headers('authorization') authHeader?: string) {
    this.verifyAdmin(authHeader);
    return this.adminBusinessService.getAllBusinesses();
  }

  // --- BRANCHES ---
  @Get('branches')
  getAllBranches(@Headers('authorization') authHeader?: string) {
    this.verifyAdmin(authHeader);
    return this.adminBusinessService.getAllBranches();
  }

  @Post('branches')
  createBranch(
    @Body() body: { name: string, status: string, businessId: string },
    @Headers('authorization') authHeader?: string
  ) {
    this.verifyAdmin(authHeader);
    return this.adminBusinessService.createBranch(body);
  }

  @Patch('branches/:id')
  updateBranch(
    @Param('id') id: string,
    @Body() body: { name?: string, status?: string, businessId?: string },
    @Headers('authorization') authHeader?: string
  ) {
    this.verifyAdmin(authHeader);
    return this.adminBusinessService.updateBranch(id, body);
  }

  @Delete('branches/:id')
  deleteBranch(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string
  ) {
    this.verifyAdmin(authHeader);
    return this.adminBusinessService.deleteBranch(id);
  }
  // ----------------

  @Patch(':id/subscription')
  updateSubscription(
    @Param('id') id: string,
    @Body() body: { subscriptionStatus: string, subscriptionStartDate: string | null, subscriptionEndDate: string | null },
    @Headers('authorization') authHeader?: string
  ) {
    this.verifyAdmin(authHeader);
    const data = {
      subscriptionStatus: body.subscriptionStatus,
      subscriptionStartDate: body.subscriptionStartDate ? new Date(body.subscriptionStartDate) : null,
      subscriptionEndDate: body.subscriptionEndDate ? new Date(body.subscriptionEndDate) : null,
    };
    return this.adminBusinessService.updateSubscription(id, data);
  }

  @Patch(':id/billing')
  updateBilling(
    @Param('id') id: string,
    @Body() body: { commissionType: string, commissionRate: number, subscriptionStatus: string, subscriptionStartDate: string | null, subscriptionEndDate: string | null },
    @Headers('authorization') authHeader?: string
  ) {
    this.verifyAdmin(authHeader);
    const data = {
      commissionType: body.commissionType,
      commissionRate: Number(body.commissionRate),
      subscriptionStatus: body.subscriptionStatus,
      subscriptionStartDate: body.subscriptionStartDate ? new Date(body.subscriptionStartDate) : null,
      subscriptionEndDate: body.subscriptionEndDate ? new Date(body.subscriptionEndDate) : null,
    };
    return this.adminBusinessService.updateBilling(id, data);
  }
}
