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
import { Controller, Get, Patch, Body, Post, Delete, Param } from '@nestjs/common';
import { SystemConfigService } from './system-config.service.js';
let SystemConfigController = class SystemConfigController {
    systemConfigService;
    constructor(systemConfigService) {
        this.systemConfigService = systemConfigService;
    }
    getSeo() {
        return this.systemConfigService.getSeoConfig();
    }
    updateSeo(body) {
        return this.systemConfigService.updateSeoConfig(body);
    }
    getAuth() {
        return this.systemConfigService.getAuthConfig();
    }
    updateAuth(body) {
        return this.systemConfigService.updateAuthConfig(body);
    }
    getQueueConfig() {
        return this.systemConfigService.getQueueConfig();
    }
    updateQueueConfig(body) {
        return this.systemConfigService.updateQueueConfig(body);
    }
    getPayment() {
        return this.systemConfigService.getPaymentMethods();
    }
    addPaymentMethod(body) {
        return this.systemConfigService.addPaymentMethod(body);
    }
    updatePaymentMethod(id, body) {
        return this.systemConfigService.updatePaymentMethod(id, body);
    }
    deletePaymentMethod(id) {
        return this.systemConfigService.deletePaymentMethod(id);
    }
    getTaxRules() {
        return this.systemConfigService.getTaxRules();
    }
    seedStatutoryGstRules() {
        return this.systemConfigService.seedStatutoryGstRules();
    }
    addTaxRule(body) {
        return this.systemConfigService.addTaxRule(body);
    }
    updateTaxRule(id, body) {
        return this.systemConfigService.updateTaxRule(id, body);
    }
    deleteTaxRule(id) {
        return this.systemConfigService.deleteTaxRule(id);
    }
};
__decorate([
    Get('seo'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SystemConfigController.prototype, "getSeo", null);
__decorate([
    Patch('seo'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SystemConfigController.prototype, "updateSeo", null);
__decorate([
    Get('auth'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SystemConfigController.prototype, "getAuth", null);
__decorate([
    Patch('auth'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SystemConfigController.prototype, "updateAuth", null);
__decorate([
    Get('queue'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SystemConfigController.prototype, "getQueueConfig", null);
__decorate([
    Patch('queue'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SystemConfigController.prototype, "updateQueueConfig", null);
__decorate([
    Get('payment'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SystemConfigController.prototype, "getPayment", null);
__decorate([
    Post('payment'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SystemConfigController.prototype, "addPaymentMethod", null);
__decorate([
    Patch('payment/:id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SystemConfigController.prototype, "updatePaymentMethod", null);
__decorate([
    Delete('payment/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SystemConfigController.prototype, "deletePaymentMethod", null);
__decorate([
    Get('tax'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SystemConfigController.prototype, "getTaxRules", null);
__decorate([
    Post('tax/seed-statutory'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SystemConfigController.prototype, "seedStatutoryGstRules", null);
__decorate([
    Post('tax'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SystemConfigController.prototype, "addTaxRule", null);
__decorate([
    Patch('tax/:id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SystemConfigController.prototype, "updateTaxRule", null);
__decorate([
    Delete('tax/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SystemConfigController.prototype, "deleteTaxRule", null);
SystemConfigController = __decorate([
    Controller('system-config'),
    __metadata("design:paramtypes", [SystemConfigService])
], SystemConfigController);
export { SystemConfigController };
//# sourceMappingURL=system-config.controller.js.map