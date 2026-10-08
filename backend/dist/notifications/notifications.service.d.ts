import { PrismaService } from '../prisma.service.js';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSmsTemplates(): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        message: string;
        updatedAt: Date;
        title: string;
    }[]>;
    createSmsTemplate(data: {
        title: string;
        message: string;
        status?: string;
    }): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        message: string;
        updatedAt: Date;
        title: string;
    }>;
    updateSmsTemplate(id: string, data: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        message: string;
        updatedAt: Date;
        title: string;
    }>;
    deleteSmsTemplate(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        message: string;
        updatedAt: Date;
        title: string;
    }>;
    getPushTemplates(): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        message: string;
        updatedAt: Date;
        title: string;
    }[]>;
    createPushTemplate(data: {
        title: string;
        message: string;
        status?: string;
    }): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        message: string;
        updatedAt: Date;
        title: string;
    }>;
    updatePushTemplate(id: string, data: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        message: string;
        updatedAt: Date;
        title: string;
    }>;
    deletePushTemplate(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        message: string;
        updatedAt: Date;
        title: string;
    }>;
    getEmailTemplates(): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        message: string;
        updatedAt: Date;
        title: string;
    }[]>;
    findHistoryForUser(userId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        userId: string | null;
        status: string;
        createdAt: Date;
        message: string;
        title: string | null;
        userType: string | null;
        channel: string;
        triggerType: string;
        recipient: string;
    }[]>;
    createEmailTemplate(data: {
        title: string;
        message: string;
        status?: string;
    }): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        message: string;
        updatedAt: Date;
        title: string;
    }>;
    updateEmailTemplate(id: string, data: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        message: string;
        updatedAt: Date;
        title: string;
    }>;
    deleteEmailTemplate(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        message: string;
        updatedAt: Date;
        title: string;
    }>;
    sendNotification(payload: {
        type: string;
        recipientId: string;
        data: any;
    }): Promise<{
        success: boolean;
        pushMessage: string;
        smsMessage: string;
    }>;
}
