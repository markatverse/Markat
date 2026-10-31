import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service.js';

@Controller('admin/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  getRoot() {
    return this.analyticsService.getSummary();
  }

  @Get('summary')
  getSummary() {
    return this.analyticsService.getSummary();
  }

  @Get('finance')
  getFinanceData() {
    return this.analyticsService.getFinanceData();
  }
}
