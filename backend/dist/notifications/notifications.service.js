var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsService_1;
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import webpush from 'web-push';
let NotificationsService = NotificationsService_1 = class NotificationsService {
    prisma;
    logger = new Logger(NotificationsService_1.name);
    subscriptions = new Map();
    constructor(prisma) {
        this.prisma = prisma;
        if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
            try {
                webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:support@markatverse.com', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
                this.logger.log('WebPush VAPID details configured successfully');
            }
            catch (err) {
                this.logger.error('Failed to configure VAPID details', err);
            }
        }
    }
    getPublicKey() {
        return { publicKey: process.env.VAPID_PUBLIC_KEY || '' };
    }
    saveSubscription(userId, subscription) {
        if (!this.subscriptions.has(userId)) {
            this.subscriptions.set(userId, []);
        }
        const userSubs = this.subscriptions.get(userId);
        const existingIndex = userSubs.findIndex(s => s.endpoint === subscription.endpoint);
        if (existingIndex >= 0) {
            userSubs[existingIndex] = subscription;
        }
        else {
            userSubs.push(subscription);
        }
        this.logger.log(`Saved push subscription for user: ${userId}`);
        return { success: true };
    }
    async getSmsTemplates() {
        return this.prisma.smsTemplate.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async createSmsTemplate(data) {
        return this.prisma.smsTemplate.create({
            data: {
                title: data.title,
                message: data.message,
                status: data.status || 'ACTIVE',
            },
        });
    }
    async updateSmsTemplate(id, data) {
        return this.prisma.smsTemplate.update({
            where: { id },
            data,
        });
    }
    async deleteSmsTemplate(id) {
        return this.prisma.smsTemplate.delete({
            where: { id },
        });
    }
    async getPushTemplates() {
        return this.prisma.pushTemplate.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async createPushTemplate(data) {
        return this.prisma.pushTemplate.create({
            data: {
                title: data.title,
                message: data.message,
                status: data.status || 'ACTIVE',
            },
        });
    }
    async updatePushTemplate(id, data) {
        return this.prisma.pushTemplate.update({
            where: { id },
            data,
        });
    }
    async deletePushTemplate(id) {
        return this.prisma.pushTemplate.delete({
            where: { id },
        });
    }
    async getEmailTemplates() {
        return this.prisma.emailTemplate.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    findHistoryForUser(userId) {
        return this.prisma.notificationLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
    async getAllLogs(limit = 100) {
        return this.prisma.notificationLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async createEmailTemplate(data) {
        return this.prisma.emailTemplate.create({
            data: {
                title: data.title,
                message: data.message,
                status: data.status || 'ACTIVE',
            },
        });
    }
    async updateEmailTemplate(id, data) {
        return this.prisma.emailTemplate.update({
            where: { id },
            data,
        });
    }
    async deleteEmailTemplate(id) {
        return this.prisma.emailTemplate.delete({
            where: { id },
        });
    }
    async sendNotification(payload) {
        console.log(`[Notification Engine] Processing ${payload.type} for recipient ${payload.recipientId}`);
        const pushTemplate = await this.prisma.pushTemplate.findFirst({
            where: { title: payload.type, status: 'ACTIVE' }
        });
        const smsTemplate = await this.prisma.smsTemplate.findFirst({
            where: { title: payload.type, status: 'ACTIVE' }
        });
        const compileMessage = (templateMessage) => {
            let msg = templateMessage;
            for (const [key, value] of Object.entries(payload.data)) {
                const regex = new RegExp(`{{${key}}}`, 'g');
                msg = msg.replace(regex, String(value));
            }
            return msg;
        };
        const pushMsgToSend = pushTemplate ? compileMessage(pushTemplate.message) : `You have a new push notification of type ${payload.type}.`;
        const smsMsgToSend = smsTemplate ? compileMessage(smsTemplate.message) : `You have a new SMS notification of type ${payload.type}.`;
        this.logger.log(`[Notification Engine] AUTOMATED PUSH SEND -> ${pushMsgToSend}`);
        this.logger.log(`[Notification Engine] AUTOMATED SMS SEND -> ${smsMsgToSend}`);
        const userSubs = this.subscriptions.get(payload.recipientId) || [];
        if (userSubs.length > 0) {
            const pushPayload = JSON.stringify({
                title: pushTemplate?.title || 'MarkatVerse Update',
                body: pushMsgToSend,
                icon: '/logo.png',
                badge: '/favicon.ico',
                data: { url: '/profile/settings' }
            });
            userSubs.forEach(sub => {
                webpush.sendNotification(sub, pushPayload).catch((err) => {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        this.subscriptions.set(payload.recipientId, (this.subscriptions.get(payload.recipientId) || []).filter(s => s.endpoint !== sub.endpoint));
                    }
                    this.logger.warn(`Web push delivery note: ${err.message || err}`);
                });
            });
        }
        try {
            await this.prisma.notificationLog.create({
                data: {
                    userId: payload.recipientId,
                    channel: 'PUSH',
                    triggerType: payload.type,
                    recipient: payload.recipientId,
                    title: pushTemplate?.title || payload.type,
                    message: pushMsgToSend,
                    status: 'SENT',
                }
            });
        }
        catch (e) {
            this.logger.warn('Failed to log notification record in database', e);
        }
        return { success: true, pushMessage: pushMsgToSend, smsMessage: smsMsgToSend };
    }
};
NotificationsService = NotificationsService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], NotificationsService);
export { NotificationsService };
//# sourceMappingURL=notifications.service.js.map