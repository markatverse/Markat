import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/password')
  updatePassword(@Param('id') id: string, @Body() body: any) {
    return this.usersService.updatePassword(id, body.currentPassword, body.newPassword);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get(':id/addresses')
  getAddresses(@Param('id') id: string) {
    return this.usersService.getAddresses(id);
  }

  @Post(':id/addresses')
  addAddress(@Param('id') id: string, @Body() body: any) {
    return this.usersService.addAddress(id, body);
  }

  @Patch('addresses/:addressId')
  updateAddress(@Param('addressId') addressId: string, @Body() body: any) {
    return this.usersService.updateAddress(addressId, body);
  }

  @Delete('addresses/:addressId')
  deleteAddress(@Param('addressId') addressId: string) {
    return this.usersService.deleteAddress(addressId);
  }
}
