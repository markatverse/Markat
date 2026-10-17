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
import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentService } from './payment.service.js';
let PaymentController = class PaymentController {
    paymentService;
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async getRazorpayKey() {
        return this.paymentService.getPublicKey();
    }
    async createRazorpayOrder(body) {
        return this.paymentService.createRazorpayOrder(body.amount, body.receipt, body.notes);
    }
    async verifyPayment(body) {
        return this.paymentService.verifyPayment(body);
    }
};
__decorate([
    Get('razorpay/key'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getRazorpayKey", null);
__decorate([
    Post('razorpay/create-order'),
    HttpCode(HttpStatus.OK),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "createRazorpayOrder", null);
__decorate([
    Post('razorpay/verify'),
    HttpCode(HttpStatus.OK),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "verifyPayment", null);
PaymentController = __decorate([
    Controller('payment'),
    __metadata("design:paramtypes", [PaymentService])
], PaymentController);
export { PaymentController };
//# sourceMappingURL=payment.controller.js.map