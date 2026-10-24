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
import { Controller, Get, Post, Patch, Delete, Body, Param, } from '@nestjs/common';
import { ServiceQueueService } from './service-queue.service.js';
let ServiceQueueController = class ServiceQueueController {
    serviceQueueService;
    constructor(serviceQueueService) {
        this.serviceQueueService = serviceQueueService;
    }
    createQueue(body) {
        return this.serviceQueueService.createQueue(body);
    }
    getQueueBySeller(sellerId) {
        return this.serviceQueueService.getQueueBySeller(sellerId);
    }
    getAllQueues() {
        return this.serviceQueueService.getAllQueues();
    }
    getQueueStatus(queueId) {
        return this.serviceQueueService.getQueueStatus(queueId);
    }
    joinQueue(queueId, body) {
        return this.serviceQueueService.joinQueue(queueId, body);
    }
    callNext(queueId, body) {
        return this.serviceQueueService.callNext(queueId, body?.resourceId, body?.staffId);
    }
    getTodayStats(queueId) {
        return this.serviceQueueService.getTodayStats(queueId);
    }
    getAnalytics(queueId) {
        return this.serviceQueueService.getAnalytics(queueId);
    }
    updateSettings(queueId, body) {
        return this.serviceQueueService.updateQueueSettings(queueId, body);
    }
    resetQueue(queueId) {
        return this.serviceQueueService.resetQueue(queueId);
    }
    updateAdminStatus(queueId, status) {
        return this.serviceQueueService.updateAdminStatus(queueId, status);
    }
    getTokenStatus(tokenId) {
        return this.serviceQueueService.getTokenStatus(tokenId);
    }
    markNoShow(tokenId) {
        return this.serviceQueueService.markNoShow(tokenId);
    }
    markDone(tokenId) {
        return this.serviceQueueService.markDone(tokenId);
    }
    checkIn(tokenId) {
        return this.serviceQueueService.checkIn(tokenId);
    }
    markAbsent(tokenId) {
        return this.serviceQueueService.markAbsent(tokenId);
    }
    markWaiting(tokenId) {
        return this.serviceQueueService.markWaiting(tokenId);
    }
    startServing(tokenId, resourceId) {
        return this.serviceQueueService.startServing(tokenId, resourceId);
    }
    addStaff(queueId, body) {
        return this.serviceQueueService.addStaff(queueId, body);
    }
    addResource(queueId, body) {
        return this.serviceQueueService.addResource(queueId, body);
    }
    deleteStaff(queueId, staffId) {
        return this.serviceQueueService.deleteStaff(queueId, staffId);
    }
    deleteResource(queueId, resourceId) {
        return this.serviceQueueService.deleteResource(queueId, resourceId);
    }
};
__decorate([
    Post('queue'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ServiceQueueController.prototype, "createQueue", null);
__decorate([
    Get('seller/:sellerId'),
    __param(0, Param('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServiceQueueController.prototype, "getQueueBySeller", null);
__decorate([
    Get('queues'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ServiceQueueController.prototype, "getAllQueues", null);
__decorate([
    Get(':queueId/status'),
    __param(0, Param('queueId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServiceQueueController.prototype, "getQueueStatus", null);
__decorate([
    Post(':queueId/join'),
    __param(0, Param('queueId')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ServiceQueueController.prototype, "joinQueue", null);
__decorate([
    Post(':queueId/next'),
    __param(0, Param('queueId')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ServiceQueueController.prototype, "callNext", null);
__decorate([
    Get(':queueId/stats'),
    __param(0, Param('queueId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServiceQueueController.prototype, "getTodayStats", null);
__decorate([
    Get(':queueId/analytics'),
    __param(0, Param('queueId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServiceQueueController.prototype, "getAnalytics", null);
__decorate([
    Patch(':queueId/settings'),
    __param(0, Param('queueId')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ServiceQueueController.prototype, "updateSettings", null);
__decorate([
    Delete(':queueId/reset'),
    __param(0, Param('queueId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServiceQueueController.prototype, "resetQueue", null);
__decorate([
    Patch(':queueId/admin-status'),
    __param(0, Param('queueId')),
    __param(1, Body('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ServiceQueueController.prototype, "updateAdminStatus", null);
__decorate([
    Get('token/:tokenId'),
    __param(0, Param('tokenId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServiceQueueController.prototype, "getTokenStatus", null);
__decorate([
    Patch('token/:tokenId/no-show'),
    __param(0, Param('tokenId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServiceQueueController.prototype, "markNoShow", null);
__decorate([
    Patch('token/:tokenId/done'),
    __param(0, Param('tokenId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServiceQueueController.prototype, "markDone", null);
__decorate([
    Post('token/:tokenId/check-in'),
    __param(0, Param('tokenId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServiceQueueController.prototype, "checkIn", null);
__decorate([
    Patch('token/:tokenId/absent'),
    __param(0, Param('tokenId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServiceQueueController.prototype, "markAbsent", null);
__decorate([
    Patch('token/:tokenId/waiting'),
    __param(0, Param('tokenId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServiceQueueController.prototype, "markWaiting", null);
__decorate([
    Patch('token/:tokenId/start'),
    __param(0, Param('tokenId')),
    __param(1, Body('resourceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ServiceQueueController.prototype, "startServing", null);
__decorate([
    Post(':queueId/staff'),
    __param(0, Param('queueId')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ServiceQueueController.prototype, "addStaff", null);
__decorate([
    Post(':queueId/resource'),
    __param(0, Param('queueId')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ServiceQueueController.prototype, "addResource", null);
__decorate([
    Delete(':queueId/staff/:staffId'),
    __param(0, Param('queueId')),
    __param(1, Param('staffId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ServiceQueueController.prototype, "deleteStaff", null);
__decorate([
    Delete(':queueId/resource/:resourceId'),
    __param(0, Param('queueId')),
    __param(1, Param('resourceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ServiceQueueController.prototype, "deleteResource", null);
ServiceQueueController = __decorate([
    Controller('service-queue'),
    __metadata("design:paramtypes", [ServiceQueueService])
], ServiceQueueController);
export { ServiceQueueController };
//# sourceMappingURL=service-queue.controller.js.map