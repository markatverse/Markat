import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import webpush from 'web-push';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private subscriptions: Map<string, any[]> = new Map();

  constructor(private prisma: PrismaService) {
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      try {
        webpush.setVapidDetails(
          process.env.VAPID_SUBJECT || 'mailto:support@markatverse.com',
          process.env.VAPID_PUBLIC_KEY,
          process.env.VAPID_PRIVATE_KEY
        );
        this.logger.log('WebPush VAPID details configured successfully');
      } catch (err) {
        this.logger.error('Failed to configure VAPID details', err);
      }
    }
  }

  getPublicKey() {
    return { publicKey: process.env.VAPID_PUBLIC_KEY || '' };
  }

  saveSubscription(userId: string, subscription: any) {
    if (!this.subscriptions.has(userId)) {
      this.subscriptions.set(userId, []);
    }
    const userSubs = this.subscriptions.get(userId)!;
    // Prevent duplicate endpoint entries
    const existingIndex = userSubs.findIndex(s => s.endpoint === subscription.endpoint);
    if (existingIndex >= 0) {
      userSubs[existingIndex] = subscription;
    } else {
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

  async createSmsTemplate(data: { title: string; message: string; status?: string }) {
    return this.prisma.smsTemplate.create({
      data: {
        title: data.title,
        message: data.message,
        status: data.status || 'ACTIVE',
      },
    });
  }

  async updateSmsTemplate(id: string, data: any) {
    return this.prisma.smsTemplate.update({
      where: { id },
      data,
    });
  }

  async deleteSmsTemplate(id: string) {
    return this.prisma.smsTemplate.delete({
      where: { id },
    });
  }

  // --- PUSH TEMPLATES ---
  async getPushTemplates() {
    return this.prisma.pushTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPushTemplate(data: { title: string; message: string; status?: string }) {
    return this.prisma.pushTemplate.create({
      data: {
        title: data.title,
        message: data.message,
        status: data.status || 'ACTIVE',
      },
    });
  }

  async updatePushTemplate(id: string, data: any) {
    return this.prisma.pushTemplate.update({
      where: { id },
      data,
    });
  }

  async deletePushTemplate(id: string) {
    return this.prisma.pushTemplate.delete({
      where: { id },
    });
  }

  // --- EMAIL TEMPLATES ---
  async getEmailTemplates() {
    return this.prisma.emailTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findHistoryForUser(userId: string) {
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


  async createEmailTemplate(data: { title: string; message: string; status?: string }) {
    return this.prisma.emailTemplate.create({
      data: {
        title: data.title,
        message: data.message,
        status: data.status || 'ACTIVE',
      },
    });
  }

  async updateEmailTemplate(id: string, data: any) {
    return this.prisma.emailTemplate.update({
      where: { id },
      data,
    });
  }

  async deleteEmailTemplate(id: string) {
    return this.prisma.emailTemplate.delete({
      where: { id },
    });
  }

  // --- CORE NOTIFICATION ENGINE ---
  async sendNotification(payload: { type: string; recipientId: string; data: any }) {
    console.log(`[Notification Engine] Processing ${payload.type} for recipient ${payload.recipientId}`);

    // Fetch active push template from database
    const pushTemplate = await this.prisma.pushTemplate.findFirst({
      where: { title: payload.type, status: 'ACTIVE' }
    });

    // Fetch active sms template from database
    const smsTemplate = await this.prisma.smsTemplate.findFirst({
      where: { title: payload.type, status: 'ACTIVE' }
    });

    const compileMessage = (templateMessage: string) => {
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

    // 1. Deliver Web Push directly to user browser device(s)
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
        webpush.sendNotification(sub, pushPayload).catch((err: any) => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            // Subscription expired or unregistered
            this.subscriptions.set(
              payload.recipientId, 
              (this.subscriptions.get(payload.recipientId) || []).filter(s => s.endpoint !== sub.endpoint)
            );
          }
          this.logger.warn(`Web push delivery note: ${err.message || err}`);
        });
      });
    }

    // 2. Persist to NotificationLog table in database
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
    } catch (e) {
      this.logger.warn('Failed to log notification record in database', e);
    }

    return { success: true, pushMessage: pushMsgToSend, smsMessage: smsMsgToSend };
  }
}

