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
import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ShippingService } from './shipping.service.js';
let ShippingController = class ShippingController {
    shippingService;
    constructor(shippingService) {
        this.shippingService = shippingService;
    }
    async checkServiceability(body) {
        return this.shippingService.checkServiceability(body.pickupPincode, body.deliveryPincode, body.weightKg || 0.5, body.isB2B || false);
    }
    async createShipment(orderId, body) {
        return this.shippingService.createB2CShipment(orderId, body.sellerId);
    }
    async requestPickup(orderId) {
        return this.shippingService.requestCourierPickup(orderId);
    }
    async trackShipment(trackingNumber) {
        return this.shippingService.getTrackingDetails(trackingNumber);
    }
    async handleWebhook(payload) {
        return this.shippingService.handleWebhook(payload);
    }
};
__decorate([
    Post('serviceability'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ShippingController.prototype, "checkServiceability", null);
__decorate([
    Post('orders/:orderId/ship'),
    __param(0, Param('orderId')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShippingController.prototype, "createShipment", null);
__decorate([
    Post('orders/:orderId/pickup'),
    __param(0, Param('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShippingController.prototype, "requestPickup", null);
__decorate([
    Get('track/:trackingNumber'),
    __param(0, Param('trackingNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShippingController.prototype, "trackShipment", null);
__decorate([
    Post('webhook'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ShippingController.prototype, "handleWebhook", null);
ShippingController = __decorate([
    Controller('shipping'),
    __metadata("design:paramtypes", [ShippingService])
], ShippingController);
export { ShippingController };
//# sourceMappingURL=shipping.controller.js.map