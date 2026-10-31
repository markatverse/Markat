import { PrismaService } from '../prisma.service.js';
export declare class NotificationsService {
    private prisma;
    private readonly logger;
    private subscriptions;
    constructor(prisma: PrismaService);
    getPublicKey(): {
        publicKey: string;
    };
    saveSubscription(userId: string, subscription: any): {
        success: boolean;
    };
    getSmsTemplates(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        message: string;
        title: string;
    }[]>;
    createSmsTemplate(data: {
        title: string;
        message: string;
        status?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        message: string;
        title: string;
    }>;
    updateSmsTemplate(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        message: string;
        title: string;
    }>;
    deleteSmsTemplate(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        message: string;
        title: string;
    }>;
    getPushTemplates(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        message: string;
        title: string;
    }[]>;
    createPushTemplate(data: {
        title: string;
        message: string;
        status?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        message: string;
        title: string;
    }>;
    updatePushTemplate(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        message: string;
        title: string;
    }>;
    deletePushTemplate(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        message: string;
        title: string;
    }>;
    getEmailTemplates(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        message: string;
        title: string;
    }[]>;
    findHistoryForUser(userId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        status: string;
        message: string;
        title: string | null;
        userType: string | null;
        channel: string;
        triggerType: string;
        recipient: string;
    }[]>;
    getAllLogs(limit?: number): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        status: string;
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
        createdAt: Date;
        updatedAt: Date;
        status: string;
        message: string;
        title: string;
    }>;
    updateEmailTemplate(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        message: string;
        title: string;
    }>;
    deleteEmailTemplate(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        message: string;
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
