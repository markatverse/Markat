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
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { WalletService } from './wallet.service.js';
let WalletController = class WalletController {
    walletService;
    constructor(walletService) {
        this.walletService = walletService;
    }
    async getWallet(businessId) {
        return this.walletService.getWallet(businessId);
    }
    async getTransactions(walletId) {
        return this.walletService.getTransactions(walletId);
    }
    async getBankAccounts(businessId) {
        return this.walletService.getBankAccounts(businessId);
    }
    async addBankAccount(businessId, data) {
        return this.walletService.addBankAccount(businessId, data);
    }
    async requestWithdrawal(businessId, body) {
        return this.walletService.requestWithdrawal(businessId, body.amount, body.bankAccountId);
    }
    async payPlatform(businessId, body) {
        return this.walletService.payPlatform(businessId, body?.fromBalance ?? false);
    }
};
__decorate([
    Get('business/:businessId'),
    __param(0, Param('businessId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getWallet", null);
__decorate([
    Get(':walletId/transactions'),
    __param(0, Param('walletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getTransactions", null);
__decorate([
    Get('business/:businessId/banks'),
    __param(0, Param('businessId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getBankAccounts", null);
__decorate([
    Post('business/:businessId/banks'),
    __param(0, Param('businessId')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "addBankAccount", null);
__decorate([
    Post('business/:businessId/withdraw'),
    __param(0, Param('businessId')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "requestWithdrawal", null);
__decorate([
    Post('business/:businessId/pay-platform'),
    __param(0, Param('businessId')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "payPlatform", null);
WalletController = __decorate([
    Controller('wallet'),
    __metadata("design:paramtypes", [WalletService])
], WalletController);
export { WalletController };
//# sourceMappingURL=wallet.controller.js.map