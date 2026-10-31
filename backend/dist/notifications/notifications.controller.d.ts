import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service.js';
export declare class NotificationsController {
    private readonly notificationsService;
    private readonly jwtService;
    constructor(notificationsService: NotificationsService, jwtService: JwtService);
    getPublicKey(): {
        publicKey: string;
    };
    subscribe(body: {
        userId: string;
        subscription: any;
    }, authorization?: string): {
        success: boolean;
    } | {
        success: boolean;
        message: string;
    };
    getAllLogs(): Promise<{
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
    getHistory(userId: string, authorization?: string): Promise<{
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
}
