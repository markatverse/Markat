var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { CommercialService } from './commercial.service.js';
let CommercialController = class CommercialController {
    commercialService;
    constructor(commercialService) {
        this.commercialService = commercialService;
    }
    getAdvertisements() { return this.commercialService.getAdvertisements(); }
    getAdvertisement(id) { return this.commercialService.getAdvertisement(id); }
    createAdvertisement(data) { return this.commercialService.createAdvertisement(data); }
    updateAdvertisement(id, data) { return this.commercialService.updateAdvertisement(id, data); }
    deleteAdvertisement(id) { return this.commercialService.deleteAdvertisement(id); }
    getCoupons() { return this.commercialService.getCoupons(); }
    getCoupon(id) { return this.commercialService.getCoupon(id); }
    createCoupon(data) { return this.commercialService.createCoupon(data); }
    updateCoupon(id, data) { return this.commercialService.updateCoupon(id, data); }
    deleteCoupon(id) { return this.commercialService.deleteCoupon(id); }
    getSubscriptions() { return this.commercialService.getSubscriptions(); }
    getSubscription(id) { return this.commercialService.getSubscription(id); }
    createSubscription(data) { return this.commercialService.createSubscription(data); }
    seedDefaultSubscriptions() { return this.commercialService.seedDefaultSubscriptions(); }
    updateSubscription(id, data) { return this.commercialService.updateSubscription(id, data); }
    deleteSubscription(id) { return this.commercialService.deleteSubscription(id); }
    getCommissions() { return this.commercialService.getCommissions(); }
    getCommission(id) { return this.commercialService.getCommission(id); }
    createCommission(data) { return this.commercialService.createCommission(data); }
    updateCommission(id, data) { return this.commercialService.updateCommission(id, data); }
    deleteCommission(id) { return this.commercialService.deleteCommission(id); }
    getRegistrationFeeStats() {
        return this.commercialService.getRegistrationFeeStats();
    }
    getRegistrationFee() {
        return this.commercialService.getRegistrationFee();
    }
    updateRegistrationFee(data) {
        return this.commercialService.updateRegistrationFee(data);
    }
    patchRegistrationFee(data) {
        return this.commercialService.updateRegistrationFee(data);
    }
    getAdsAdminOverview() {
        return this.commercialService.getAdsAdminOverview();
    }
    moderateCampaign(body) {
        return this.commercialService.moderateCampaign(body.campaignId, body.status, body.reason);
    }
    getPlacementsConfig() {
        return this.commercialService.getPlacementsConfig();
    }
    updatePlacementsConfig(body) {
        return this.commercialService.updatePlacementsConfig(body);
    }
    topupAdvertiserWallet(body) {
        return this.commercialService.topupAdvertiserWallet(body.advertiserId, body.amount);
    }
    getAdvertiserCampaigns(advertiserId) {
        return this.commercialService.getAdvertiserCampaigns(advertiserId);
    }
    createAdvertiserCampaign(data) {
        return this.commercialService.createAdvertiserCampaign(data);
    }
    toggleCampaignStatus(id) {
        return this.commercialService.toggleCampaignStatus(id);
    }
    getAdvertiserProfile(id) {
        return this.commercialService.getAdvertiserProfile(id);
    }
};
__decorate([
    Get('advertisements'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "getAdvertisements", null);
__decorate([
    Get('advertisements/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "getAdvertisement", null);
__decorate([
    Post('advertisements'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "createAdvertisement", null);
__decorate([
    Patch('advertisements/:id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "updateAdvertisement", null);
__decorate([
    Delete('advertisements/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "deleteAdvertisement", null);
__decorate([
    Get('coupons'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "getCoupons", null);
__decorate([
    Get('coupons/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "getCoupon", null);
__decorate([
    Post('coupons'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "createCoupon", null);
__decorate([
    Patch('coupons/:id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "updateCoupon", null);
__decorate([
    Delete('coupons/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "deleteCoupon", null);
__decorate([
    Get('subscriptions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "getSubscriptions", null);
__decorate([
    Get('subscriptions/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "getSubscription", null);
__decorate([
    Post('subscriptions'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "createSubscription", null);
__decorate([
    Post('subscriptions/seed-defaults'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "seedDefaultSubscriptions", null);
__decorate([
    Patch('subscriptions/:id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "updateSubscription", null);
__decorate([
    Delete('subscriptions/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "deleteSubscription", null);
__decorate([
    Get('commissions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "getCommissions", null);
__decorate([
    Get('commissions/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "getCommission", null);
__decorate([
    Post('commissions'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "createCommission", null);
__decorate([
    Patch('commissions/:id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "updateCommission", null);
__decorate([
    Delete('commissions/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "deleteCommission", null);
__decorate([
    Get('registration-fee/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "getRegistrationFeeStats", null);
__decorate([
    Get('registration-fee'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "getRegistrationFee", null);
__decorate([
    Post('registration-fee'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "updateRegistrationFee", null);
__decorate([
    Patch('registration-fee'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "patchRegistrationFee", null);
__decorate([
    Get('ads/admin-overview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "getAdsAdminOverview", null);
__decorate([
    Post('ads/campaigns/moderate'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "moderateCampaign", null);
__decorate([
    Get('ads/placements'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "getPlacementsConfig", null);
__decorate([
    Post('ads/placements'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "updatePlacementsConfig", null);
__decorate([
    Post('ads/advertiser/topup'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "topupAdvertiserWallet", null);
__decorate([
    Get('ads/campaigns'),
    __param(0, Query('advertiserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "getAdvertiserCampaigns", null);
__decorate([
    Post('ads/campaigns'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "createAdvertiserCampaign", null);
__decorate([
    Patch('ads/campaigns/:id/toggle'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "toggleCampaignStatus", null);
__decorate([
    Get('ads/advertisers/:id/profile'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommercialController.prototype, "getAdvertiserProfile", null);
CommercialController = __decorate([
    Controller('commercial'),
    __metadata("design:paramtypes", [CommercialService])
], CommercialController);
export { CommercialController };
//# sourceMappingURL=commercial.controller.js.map