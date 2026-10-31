import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma.service.js';
export interface AuditLogDto {
    action: string;
    entityType: string;
    entityId?: string;
    actorId?: string;
    actorRole?: string;
    details?: Record<string, any>;
    status?: 'SUCCESS' | 'FAILED';
}
export interface ExceptionDto {
    type: string;
    severity?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    referenceId?: string;
    referenceType?: string;
    message: string;
    details?: Record<string, any>;
}
export declare class EventsService {
    private eventEmitter;
    private prisma;
    private readonly logger;
    constructor(eventEmitter: EventEmitter2, prisma: PrismaService);
    emit(event: string, payload: any): void;
    logAction(data: AuditLogDto): Promise<{
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
    } | undefined>;
    logException(data: ExceptionDto): Promise<{
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
    } | undefined>;
}
