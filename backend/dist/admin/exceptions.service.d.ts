import { PrismaService } from '../prisma.service.js';
export declare class ExceptionsService {
    private prisma;
    constructor(prisma: PrismaService);
    getExceptions(status?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        status: string;
        message: string;
        type: string;
        severity: string;
        referenceId: string | null;
        referenceType: string | null;
        assignedTo: string | null;
    }[]>;
    resolveException(id: string, notes?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        status: string;
        message: string;
        type: string;
        severity: string;
        referenceId: string | null;
        referenceType: string | null;
        assignedTo: string | null;
    }>;
    getAuditLogs(entityType?: string, entityId?: string): Promise<{
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
}
