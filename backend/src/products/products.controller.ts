import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductsService } from './products.service.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() data: any) {
    return this.productsService.create(data);
  }

  @Get()
  findAll(
    @Query('location') location?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radius') radius?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('subcategory') subcategory?: string,
    @Query('type') type?: string,
    @Query('isB2B') isB2B?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.productsService.findAll(
      location, 
      lat ? parseFloat(lat) : undefined, 
      lng ? parseFloat(lng) : undefined, 
      radius ? parseFloat(radius) : undefined,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
      {
        q: q || search,
        category,
        subcategory,
        type,
        isB2B: isB2B !== undefined ? isB2B === 'true' : undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        sortBy,
      }
    );
  }

  @Get('dummy-status')
  getDummyStatus() {
    return this.productsService.getDummyStatus();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post('toggle-dummy')
  toggleDummy(@Body('enable') enable: boolean) {
    return this.productsService.toggleDummyData(enable);
  }

  @Patch(':id/admin-status')
  updateAdminStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.productsService.updateAdminStatus(id, status);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.productsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
