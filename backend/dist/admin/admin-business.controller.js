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
import { Controller, Get, Post, Patch, Delete, Param, Body, Headers, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminBusinessService } from './admin-business.service.js';
let AdminBusinessController = class AdminBusinessController {
    adminBusinessService;
    jwtService;
    constructor(adminBusinessService, jwtService) {
        this.adminBusinessService = adminBusinessService;
        this.jwtService = jwtService;
    }
    verifyAdmin(authHeader) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Admin authentication required');
        }
        try {
            const token = authHeader.replace('Bearer ', '');
            const decoded = this.jwtService.verify(token);
            if (decoded.role !== 'ADMIN' && decoded.role !== 'SUPER_ADMIN') {
                throw new ForbiddenException('Admin access required');
            }
            return decoded;
        }
        catch {
            throw new UnauthorizedException('Invalid or expired admin session');
        }
    }
    getAllBusinesses(authHeader) {
        this.verifyAdmin(authHeader);
        return this.adminBusinessService.getAllBusinesses();
    }
    getAllBranches(authHeader) {
        this.verifyAdmin(authHeader);
        return this.adminBusinessService.getAllBranches();
    }
    createBranch(body, authHeader) {
        this.verifyAdmin(authHeader);
        return this.adminBusinessService.createBranch(body);
    }
    updateBranch(id, body, authHeader) {
        this.verifyAdmin(authHeader);
        return this.adminBusinessService.updateBranch(id, body);
    }
    deleteBranch(id, authHeader) {
        this.verifyAdmin(authHeader);
        return this.adminBusinessService.deleteBranch(id);
    }
    updateSubscription(id, body, authHeader) {
        this.verifyAdmin(authHeader);
        const data = {
            subscriptionStatus: body.subscriptionStatus,
            subscriptionStartDate: body.subscriptionStartDate ? new Date(body.subscriptionStartDate) : null,
            subscriptionEndDate: body.subscriptionEndDate ? new Date(body.subscriptionEndDate) : null,
        };
        return this.adminBusinessService.updateSubscription(id, data);
    }
    updateBilling(id, body, authHeader) {
        this.verifyAdmin(authHeader);
        const data = {
            commissionType: body.commissionType,
            commissionRate: Number(body.commissionRate),
            subscriptionStatus: body.subscriptionStatus,
            subscriptionStartDate: body.subscriptionStartDate ? new Date(body.subscriptionStartDate) : null,
            subscriptionEndDate: body.subscriptionEndDate ? new Date(body.subscriptionEndDate) : null,
        };
        return this.adminBusinessService.updateBilling(id, data);
    }
};
__decorate([
    Get(),
    __param(0, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminBusinessController.prototype, "getAllBusinesses", null);
__decorate([
    Get('branches'),
    __param(0, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminBusinessController.prototype, "getAllBranches", null);
__decorate([
    Post('branches'),
    __param(0, Body()),
    __param(1, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AdminBusinessController.prototype, "createBranch", null);
__decorate([
    Patch('branches/:id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], AdminBusinessController.prototype, "updateBranch", null);
__decorate([
    Delete('branches/:id'),
    __param(0, Param('id')),
    __param(1, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminBusinessController.prototype, "deleteBranch", null);
__decorate([
    Patch(':id/subscription'),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], AdminBusinessController.prototype, "updateSubscription", null);
__decorate([
    Patch(':id/billing'),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], AdminBusinessController.prototype, "updateBilling", null);
AdminBusinessController = __decorate([
    Controller('admin/businesses'),
    __metadata("design:paramtypes", [AdminBusinessService,
        JwtService])
], AdminBusinessController);
export { AdminBusinessController };
//# sourceMappingURL=admin-business.controller.js.map