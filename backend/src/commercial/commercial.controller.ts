import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { CommercialService } from './commercial.service.js';

@Controller('commercial')
export class CommercialController {
  constructor(private readonly commercialService: CommercialService) {}

  // Advertisements
  @Get('advertisements')
  getAdvertisements() { return this.commercialService.getAdvertisements(); }

  @Get('advertisements/:id')
  getAdvertisement(@Param('id') id: string) { return this.commercialService.getAdvertisement(id); }

  @Post('advertisements')
  createAdvertisement(@Body() data: any) { return this.commercialService.createAdvertisement(data); }

  @Patch('advertisements/:id')
  updateAdvertisement(@Param('id') id: string, @Body() data: any) { return this.commercialService.updateAdvertisement(id, data); }

  @Delete('advertisements/:id')
  deleteAdvertisement(@Param('id') id: string) { return this.commercialService.deleteAdvertisement(id); }

  // Coupons
  @Get('coupons')
  getCoupons() { return this.commercialService.getCoupons(); }

  @Get('coupons/:id')
  getCoupon(@Param('id') id: string) { return this.commercialService.getCoupon(id); }

  @Post('coupons')
  createCoupon(@Body() data: any) { return this.commercialService.createCoupon(data); }

  @Patch('coupons/:id')
  updateCoupon(@Param('id') id: string, @Body() data: any) { return this.commercialService.updateCoupon(id, data); }

  @Delete('coupons/:id')
  deleteCoupon(@Param('id') id: string) { return this.commercialService.deleteCoupon(id); }

  // Subscriptions with Statutory 18% GST (SAC 998319)
  @Get('subscriptions')
  getSubscriptions() { return this.commercialService.getSubscriptions(); }

  @Get('subscriptions/:id')
  getSubscription(@Param('id') id: string) { return this.commercialService.getSubscription(id); }

  @Post('subscriptions')
  createSubscription(@Body() data: any) { return this.commercialService.createSubscription(data); }

  @Post('subscriptions/seed-defaults')
  seedDefaultSubscriptions() { return this.commercialService.seedDefaultSubscriptions(); }

  @Patch('subscriptions/:id')
  updateSubscription(@Param('id') id: string, @Body() data: any) { return this.commercialService.updateSubscription(id, data); }

  @Delete('subscriptions/:id')
  deleteSubscription(@Param('id') id: string) { return this.commercialService.deleteSubscription(id); }

  // Commission
  @Get('commissions')
  getCommissions() { return this.commercialService.getCommissions(); }

  @Get('commissions/:id')
  getCommission(@Param('id') id: string) { return this.commercialService.getCommission(id); }

  @Post('commissions')
  createCommission(@Body() data: any) { return this.commercialService.createCommission(data); }

  @Patch('commissions/:id')
  updateCommission(@Param('id') id: string, @Body() data: any) { return this.commercialService.updateCommission(id, data); }

  @Delete('commissions/:id')
  deleteCommission(@Param('id') id: string) { return this.commercialService.deleteCommission(id); }

  // Registration Fee & Occasion Discounts
  @Get('registration-fee/stats')
  getRegistrationFeeStats() {
    return this.commercialService.getRegistrationFeeStats();
  }

  @Get('registration-fee')
  getRegistrationFee() {
    return this.commercialService.getRegistrationFee();
  }

  @Post('registration-fee')
  updateRegistrationFee(@Body() data: any) {
    return this.commercialService.updateRegistrationFee(data);
  }

  @Patch('registration-fee')
  patchRegistrationFee(@Body() data: any) {
    return this.commercialService.updateRegistrationFee(data);
  }

  // Advertising Platform Management (Admin)
  @Get('ads/admin-overview')
  getAdsAdminOverview() {
    return this.commercialService.getAdsAdminOverview();
  }

  @Post('ads/campaigns/moderate')
  moderateCampaign(@Body() body: { campaignId: string; status: 'APPROVED' | 'REJECTED'; reason?: string }) {
    return this.commercialService.moderateCampaign(body.campaignId, body.status, body.reason);
  }

  @Get('ads/placements')
  getPlacementsConfig() {
    return this.commercialService.getPlacementsConfig();
  }

  @Post('ads/placements')
  updatePlacementsConfig(@Body() body: any) {
    return this.commercialService.updatePlacementsConfig(body);
  }

  @Post('ads/advertiser/topup')
  topupAdvertiserWallet(@Body() body: { advertiserId: string; amount: number }) {
    return this.commercialService.topupAdvertiserWallet(body.advertiserId, body.amount);
  }


  // --- Advertiser Public / Merchant Campaign Endpoints ---
  @Get('ads/campaigns')
  getAdvertiserCampaigns(@Query('advertiserId') advertiserId?: string) {
    return this.commercialService.getAdvertiserCampaigns(advertiserId);
  }

  @Post('ads/campaigns')
  createAdvertiserCampaign(@Body() data: any) {
    return this.commercialService.createAdvertiserCampaign(data);
  }

  @Patch('ads/campaigns/:id/toggle')
  toggleCampaignStatus(@Param('id') id: string) {
    return this.commercialService.toggleCampaignStatus(id);
  }

  @Get('ads/advertisers/:id/profile')
  getAdvertiserProfile(@Param('id') id: string) {
    return this.commercialService.getAdvertiserProfile(id);
  }

}
