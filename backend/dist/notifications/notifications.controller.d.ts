import { NotificationsService } from './notifications.service.js';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
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
}
