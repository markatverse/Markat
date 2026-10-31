import { Controller, Get, Patch, Body, Post, Delete, Param } from '@nestjs/common';
import { SystemConfigService } from './system-config.service.js';

@Controller('system-config')
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) {}

  @Get('seo')
  getSeo() {
    return this.systemConfigService.getSeoConfig();
  }

  @Patch('seo')
  updateSeo(@Body() body: { title: string; description: string }) {
    return this.systemConfigService.updateSeoConfig(body);
  }

  @Get('auth')
  getAuth() {
    return this.systemConfigService.getAuthConfig();
  }

  @Patch('auth')
  updateAuth(@Body() body: any) {
    return this.systemConfigService.updateAuthConfig(body);
  }

  // --- Queue Config ---
  @Get('queue')
  getQueueConfig() {
    return this.systemConfigService.getQueueConfig();
  }

  @Patch('queue')
  updateQueueConfig(@Body() body: { travelSpeedKmh: number; notificationBufferMin: number }) {
    return this.systemConfigService.updateQueueConfig(body);
  }

  // --- Payment Endpoints ---

  @Get('payment')
  getPayment() {
    return this.systemConfigService.getPaymentMethods();
  }

  @Post('payment')
  addPaymentMethod(@Body() body: any) {
    return this.systemConfigService.addPaymentMethod(body);
  }

  @Patch('payment/:id')
  updatePaymentMethod(@Param('id') id: string, @Body() body: any) {
    return this.systemConfigService.updatePaymentMethod(id, body);
  }

  @Delete('payment/:id')
  deletePaymentMethod(@Param('id') id: string) {
    return this.systemConfigService.deletePaymentMethod(id);
  }

  // --- Tax Endpoints ---
  @Get('tax')
  getTaxRules() {
    return this.systemConfigService.getTaxRules();
  }

  @Post('tax/seed-statutory')
  seedStatutoryGstRules() {
    return this.systemConfigService.seedStatutoryGstRules();
  }

  @Post('tax')
  addTaxRule(@Body() body: { name: string; rate: number; status?: string }) {
    return this.systemConfigService.addTaxRule(body);
  }

  @Patch('tax/:id')
  updateTaxRule(@Param('id') id: string, @Body() body: any) {
    return this.systemConfigService.updateTaxRule(id, body);
  }

  @Delete('tax/:id')
  deleteTaxRule(@Param('id') id: string) {
    return this.systemConfigService.deleteTaxRule(id);
  }
}
