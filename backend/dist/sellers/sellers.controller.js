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
import { Controller, Get, Post, Body, Patch, Param, Delete, Headers } from '@nestjs/common';
import { SellersService } from './sellers.service.js';
import { JwtService } from '@nestjs/jwt';
let SellersController = class SellersController {
    sellersService;
    jwtService;
    constructor(sellersService, jwtService) {
        this.sellersService = sellersService;
        this.jwtService = jwtService;
    }
    create(createSellerDto, authHeader) {
        let userId;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.replace('Bearer ', '');
                const payload = this.jwtService.verify(token);
                userId = payload.sub;
            }
            catch { }
        }
        return this.sellersService.create(createSellerDto, userId);
    }
    findAll() {
        return this.sellersService.findAll();
    }
    updateStatus(id, status, kycCallStatus, kycNotes) {
        return this.sellersService.updateStatus(id, status, { kycCallStatus, kycNotes });
    }
    updateKyc(id, body) {
        return this.sellersService.updateKyc(id, body);
    }
    updateUser(userId, data) {
        return this.sellersService.updateUser(userId, data);
    }
    removeUser(userId) {
        return this.sellersService.removeUser(userId);
    }
};
__decorate([
    Post(),
    __param(0, Body()),
    __param(1, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SellersController.prototype, "create", null);
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SellersController.prototype, "findAll", null);
__decorate([
    Patch(':id/status'),
    __param(0, Param('id')),
    __param(1, Body('status')),
    __param(2, Body('kycCallStatus')),
    __param(3, Body('kycNotes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], SellersController.prototype, "updateStatus", null);
__decorate([
    Patch(':id/kyc'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SellersController.prototype, "updateKyc", null);
__decorate([
    Patch('user/:userId'),
    __param(0, Param('userId')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SellersController.prototype, "updateUser", null);
__decorate([
    Delete('user/:userId'),
    __param(0, Param('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SellersController.prototype, "removeUser", null);
SellersController = __decorate([
    Controller('sellers'),
    __metadata("design:paramtypes", [SellersService,
        JwtService])
], SellersController);
export { SellersController };
//# sourceMappingURL=sellers.controller.js.map