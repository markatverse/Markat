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
import { Controller, Post, Get, Body, Param, Patch, Headers, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ShippingService } from './shipping.service.js';
let ShippingController = class ShippingController {
    shippingService;
    jwtService;
    constructor(shippingService, jwtService) {
        this.shippingService = shippingService;
        this.jwtService = jwtService;
    }
    verifyAdminOrStaff(authHeader) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            if (process.env.NODE_ENV !== 'production')
                return;
            throw new UnauthorizedException('Authentication token required');
        }
        try {
            const token = authHeader.replace('Bearer ', '');
            const decoded = this.jwtService.verify(token);
            if (decoded.role !== 'ADMIN' && decoded.role !== 'SUPER_ADMIN' && decoded.role !== 'DISPATCHER') {
                throw new ForbiddenException('Admin / Dispatcher privileges required');
            }
            return decoded;
        }
        catch {
            if (process.env.NODE_ENV !== 'production')
                return;
            throw new UnauthorizedException('Invalid or expired session');
        }
    }
    async getDeliveryOverview(authHeader) {
        this.verifyAdminOrStaff(authHeader);
        return this.shippingService.getDeliveryOverview();
    }
    async assignDispatch(body, authHeader) {
        this.verifyAdminOrStaff(authHeader);
        return this.shippingService.assignDispatch(body.dispatchId, body.riderId);
    }
    async updateRiderKyc(id, body, authHeader) {
        this.verifyAdminOrStaff(authHeader);
        return this.shippingService.updateRiderKyc(id, body.status, body.reason);
    }
    async getDeliveryZones() {
        return this.shippingService.getDeliveryZones();
    }
    async updateDeliveryZones(body, authHeader) {
        this.verifyAdminOrStaff(authHeader);
        return this.shippingService.updateDeliveryZones(body);
    }
    async settleRiderPayouts(body, authHeader) {
        this.verifyAdminOrStaff(authHeader);
        return this.shippingService.settleRiderPayouts(body);
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
    Get('delivery/overview'),
    __param(0, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShippingController.prototype, "getDeliveryOverview", null);
__decorate([
    Post('delivery/dispatch/assign'),
    __param(0, Body()),
    __param(1, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ShippingController.prototype, "assignDispatch", null);
__decorate([
    Patch('delivery/fleet/:id/kyc'),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], ShippingController.prototype, "updateRiderKyc", null);
__decorate([
    Get('delivery/zones'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShippingController.prototype, "getDeliveryZones", null);
__decorate([
    Post('delivery/zones'),
    __param(0, Body()),
    __param(1, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ShippingController.prototype, "updateDeliveryZones", null);
__decorate([
    Post('delivery/payouts/settle'),
    __param(0, Body()),
    __param(1, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ShippingController.prototype, "settleRiderPayouts", null);
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
    __metadata("design:paramtypes", [ShippingService,
        JwtService])
], ShippingController);
export { ShippingController };
//# sourceMappingURL=shipping.controller.js.map