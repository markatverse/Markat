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
import { Controller, Get, Post, Put, Delete, Body, Param, Headers, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service.js';
let NotificationsController = class NotificationsController {
    notificationsService;
    jwtService;
    constructor(notificationsService, jwtService) {
        this.notificationsService = notificationsService;
        this.jwtService = jwtService;
    }
    getPublicKey() {
        return this.notificationsService.getPublicKey();
    }
    subscribe(body, authorization) {
        if (!body.subscription || !body.userId) {
            return { success: false, message: 'Invalid subscription payload' };
        }
        return this.notificationsService.saveSubscription(body.userId, body.subscription);
    }
    async getAllLogs() {
        return this.notificationsService.getAllLogs();
    }
    async getHistory(userId, authorization) {
        const token = authorization?.startsWith('Bearer ')
            ? authorization.slice(7)
            : undefined;
        if (!token)
            throw new UnauthorizedException('Authentication required');
        let authenticatedUserId;
        try {
            const decoded = this.jwtService.verify(token);
            authenticatedUserId = decoded.sub || decoded.id;
        }
        catch {
            throw new UnauthorizedException('Invalid or expired session');
        }
        const targetId = (userId === 'me' || !userId) ? authenticatedUserId : userId;
        if (authenticatedUserId !== targetId) {
            throw new ForbiddenException('Access denied');
        }
        return this.notificationsService.findHistoryForUser(targetId);
    }
    async getSmsTemplates() {
        return this.notificationsService.getSmsTemplates();
    }
    async createSmsTemplate(data) {
        return this.notificationsService.createSmsTemplate(data);
    }
    async updateSmsTemplate(id, data) {
        return this.notificationsService.updateSmsTemplate(id, data);
    }
    async deleteSmsTemplate(id) {
        return this.notificationsService.deleteSmsTemplate(id);
    }
    async getPushTemplates() {
        return this.notificationsService.getPushTemplates();
    }
    async createPushTemplate(data) {
        return this.notificationsService.createPushTemplate(data);
    }
    async updatePushTemplate(id, data) {
        return this.notificationsService.updatePushTemplate(id, data);
    }
    async deletePushTemplate(id) {
        return this.notificationsService.deletePushTemplate(id);
    }
    async getEmailTemplates() {
        return this.notificationsService.getEmailTemplates();
    }
    async createEmailTemplate(data) {
        return this.notificationsService.createEmailTemplate(data);
    }
    async updateEmailTemplate(id, data) {
        return this.notificationsService.updateEmailTemplate(id, data);
    }
    async deleteEmailTemplate(id) {
        return this.notificationsService.deleteEmailTemplate(id);
    }
};
__decorate([
    Get('public-key'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "getPublicKey", null);
__decorate([
    Post('subscribe'),
    __param(0, Body()),
    __param(1, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "subscribe", null);
__decorate([
    Get('logs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getAllLogs", null);
__decorate([
    Get('history/:userId'),
    __param(0, Param('userId')),
    __param(1, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getHistory", null);
__decorate([
    Get('sms'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getSmsTemplates", null);
__decorate([
    Post('sms'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "createSmsTemplate", null);
__decorate([
    Put('sms/:id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "updateSmsTemplate", null);
__decorate([
    Delete('sms/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "deleteSmsTemplate", null);
__decorate([
    Get('push'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getPushTemplates", null);
__decorate([
    Post('push'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "createPushTemplate", null);
__decorate([
    Put('push/:id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "updatePushTemplate", null);
__decorate([
    Delete('push/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "deletePushTemplate", null);
__decorate([
    Get('email'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getEmailTemplates", null);
__decorate([
    Post('email'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "createEmailTemplate", null);
__decorate([
    Put('email/:id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "updateEmailTemplate", null);
__decorate([
    Delete('email/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "deleteEmailTemplate", null);
NotificationsController = __decorate([
    Controller('admin/notifications'),
    __metadata("design:paramtypes", [NotificationsService,
        JwtService])
], NotificationsController);
export { NotificationsController };
//# sourceMappingURL=notifications.controller.js.map