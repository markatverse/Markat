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
import { Controller, Get, Post, Body, Patch, Param, Delete, Headers, Query, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { SellersService } from './sellers.service.js';
import { JwtService } from '@nestjs/jwt';
let SellersController = class SellersController {
    sellersService;
    jwtService;
    constructor(sellersService, jwtService) {
        this.sellersService = sellersService;
        this.jwtService = jwtService;
    }
    verifyAdmin(authHeader) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Authentication token required');
        }
        try {
            const token = authHeader.replace('Bearer ', '');
            const decoded = this.jwtService.verify(token);
            if (decoded.role !== 'ADMIN' && decoded.role !== 'SUPER_ADMIN') {
                throw new ForbiddenException('Admin privileges required');
            }
            return decoded;
        }
        catch {
            throw new UnauthorizedException('Invalid or expired admin session');
        }
    }
    verifyUserOrAdmin(userId, authHeader) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Authentication token required');
        }
        try {
            const token = authHeader.replace('Bearer ', '');
            const decoded = this.jwtService.verify(token);
            const isOwner = decoded.sub === userId || decoded.id === userId;
            const isAdmin = decoded.role === 'ADMIN' || decoded.role === 'SUPER_ADMIN';
            if (!isOwner && !isAdmin) {
                throw new ForbiddenException('Access denied');
            }
            return decoded;
        }
        catch {
            throw new UnauthorizedException('Invalid or expired session');
        }
    }
    getGstReport(sellerId, month, authHeader) {
        let extractedUserId = sellerId;
        if (!extractedUserId && authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.replace('Bearer ', '');
                const payload = this.jwtService.verify(token);
                extractedUserId = payload.sub;
            }
            catch { }
        }
        return this.sellersService.getSellerGstReport(extractedUserId, month);
    }
    sendCaReport(body, authHeader) {
        let extractedUserId = body.sellerId || '';
        if (!extractedUserId && authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.replace('Bearer ', '');
                const payload = this.jwtService.verify(token);
                extractedUserId = payload.sub;
            }
            catch { }
        }
        return this.sellersService.sendCaGstReport(extractedUserId, body);
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
    updateStatus(id, status, authHeader, kycCallStatus, kycNotes) {
        this.verifyAdmin(authHeader);
        return this.sellersService.updateStatus(id, status, { kycCallStatus, kycNotes });
    }
    updateKyc(id, body, authHeader) {
        this.verifyAdmin(authHeader);
        return this.sellersService.updateKyc(id, body);
    }
    updateRegistrationFee(id, body, authHeader) {
        this.verifyAdmin(authHeader);
        return this.sellersService.updateRegistrationFee(id, body);
    }
    updateUser(userId, data, authHeader) {
        this.verifyUserOrAdmin(userId, authHeader);
        return this.sellersService.updateUser(userId, data);
    }
    removeUser(userId, authHeader) {
        this.verifyUserOrAdmin(userId, authHeader);
        return this.sellersService.removeUser(userId);
    }
};
__decorate([
    Get('gst-reports'),
    __param(0, Query('sellerId')),
    __param(1, Query('month')),
    __param(2, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], SellersController.prototype, "getGstReport", null);
__decorate([
    Post('gst-reports/send-ca'),
    __param(0, Body()),
    __param(1, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SellersController.prototype, "sendCaReport", null);
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
    __param(2, Headers('authorization')),
    __param(3, Body('kycCallStatus')),
    __param(4, Body('kycNotes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], SellersController.prototype, "updateStatus", null);
__decorate([
    Patch(':id/kyc'),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], SellersController.prototype, "updateKyc", null);
__decorate([
    Patch(':id/registration-fee'),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], SellersController.prototype, "updateRegistrationFee", null);
__decorate([
    Patch('user/:userId'),
    __param(0, Param('userId')),
    __param(1, Body()),
    __param(2, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], SellersController.prototype, "updateUser", null);
__decorate([
    Delete('user/:userId'),
    __param(0, Param('userId')),
    __param(1, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SellersController.prototype, "removeUser", null);
SellersController = __decorate([
    Controller('sellers'),
    __metadata("design:paramtypes", [SellersService,
        JwtService])
], SellersController);
export { SellersController };
//# sourceMappingURL=sellers.controller.js.map