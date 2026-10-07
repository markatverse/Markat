import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) { }

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

    console.log(`[Notification Engine] AUTOMATED PUSH SEND -> ${pushMsgToSend}`);
    console.log(`[Notification Engine] AUTOMATED SMS SEND -> ${smsMsgToSend}`);

    // Example: Log to a hypothetical Notifications table
    // return this.prisma.notificationHistory.create({ ... })
    return { success: true, pushMessage: pushMsgToSend, smsMessage: smsMsgToSend };
  }
}
