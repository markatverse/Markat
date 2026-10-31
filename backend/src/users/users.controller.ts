import { Controller, Get, Post, Body, Patch, Param, Delete, Headers, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private authenticateOwner(
    userId: string,
    authorization?: string,
  ) {
    const claims = this.authenticateToken(authorization);
    if (claims.sub !== userId) throw new ForbiddenException('Access denied');
    return claims;
  }

  private authenticateToken(authorization?: string) {
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : undefined;
    if (!token) throw new UnauthorizedException('Authentication required');

    try {
      const claims = this.jwtService.verify<{ sub: string; role?: string }>(token);
      if (!claims.sub) throw new UnauthorizedException('Invalid or expired session');
      return claims;
    } catch {
      throw new UnauthorizedException('Invalid or expired session');
    }
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Headers('authorization') authorization?: string) {
    const claims = this.authenticateToken(authorization);
    if (claims.role !== 'ADMIN' && claims.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Admin privileges required to view user directory');
    }
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Headers('authorization') authorization?: string) {
    const claims = this.authenticateToken(authorization);
    if (claims.sub !== id && claims.role !== 'ADMIN' && claims.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Access denied');
    }
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: Record<string, unknown>,
    @Headers('authorization') authorization?: string,
  ) {
    const actor = this.authenticateToken(authorization);
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(
      (await this.usersService.findRole(actor.sub))?.toUpperCase() || '',
    );
    if (actor.sub !== id && !isAdmin) throw new ForbiddenException('Access denied');
    const profileData = {
      name: updateUserDto.name,
      email: updateUserDto.email,
      phone: updateUserDto.phone,
    };
    return this.usersService.update(id, isAdmin ? updateUserDto : profileData);
  }

  @Patch(':id/password')
  async updatePassword(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') authorization?: string,
  ) {
    this.authenticateOwner(id, authorization);
    return this.usersService.updatePassword(id, body.currentPassword, body.newPassword);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('authorization') authorization?: string) {
    const claims = this.authenticateToken(authorization);
    if (claims.sub !== id && claims.role !== 'ADMIN' && claims.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Admin access required to delete accounts');
    }
    return this.usersService.remove(id);
  }

  @Get(':id/addresses')
  async getAddresses(
    @Param('id') id: string,
    @Headers('authorization') authorization?: string,
  ) {
    this.authenticateOwner(id, authorization);
    return this.usersService.getAddresses(id);
  }

  @Post(':id/addresses')
  async addAddress(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') authorization?: string,
  ) {
    this.authenticateOwner(id, authorization);
    return this.usersService.addAddress(id, body);
  }

  @Patch('addresses/:addressId')
  async updateAddress(
    @Param('addressId') addressId: string,
    @Body() body: any,
    @Headers('authorization') authorization?: string,
  ) {
    const userId = this.authenticateToken(authorization).sub;
    return this.usersService.updateAddress(userId, addressId, body);
  }

  @Delete('addresses/:addressId')
  deleteAddress(
    @Param('addressId') addressId: string,
    @Headers('authorization') authorization?: string,
  ) {
    const userId = this.authenticateToken(authorization).sub;
    return this.usersService.deleteAddress(userId, addressId);
  }

}
