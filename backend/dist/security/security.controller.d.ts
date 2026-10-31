import { SecurityService } from './security.service.js';
export declare class SecurityController {
    private readonly securityService;
    constructor(securityService: SecurityService);
    getAuditLogs(): Promise<{
        userMarkatId: string | null | undefined;
        id: string;
        createdAt: Date;
        logId: string | null;
        action: string;
        resource: string | null;
        entityType: string | null;
        entityId: string | null;
        details: string | null;
        detailsJson: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string | null;
        actorRole: string | null;
        ipAddress: string | null;
        status: string;
    }[]>;
    createAuditLog(body: any): Promise<{
        id: string;
        createdAt: Date;
        logId: string | null;
        action: string;
        resource: string | null;
        entityType: string | null;
        entityId: string | null;
        details: string | null;
        detailsJson: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string | null;
        actorRole: string | null;
        ipAddress: string | null;
        status: string;
    }>;
    getAlerts(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        title: string;
    }[]>;
    createAlert(body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        title: string;
    }>;
    updateAlert(id: string, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        title: string;
    }>;
    deleteAlert(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        title: string;
    }>;
}
