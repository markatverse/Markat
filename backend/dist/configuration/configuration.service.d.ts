import { PrismaService } from '../prisma.service.js';
import { MainType } from '@prisma/client';
export declare class ConfigurationService {
    private prisma;
    constructor(prisma: PrismaService);
    getBusinessTypes(mainType?: MainType): Promise<({
        sectors: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            parameters: import("@prisma/client/runtime/library").JsonValue | null;
            isActive: boolean;
            businessTypeId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        mainType: import(".prisma/client").$Enums.MainType;
        isActive: boolean;
    })[]>;
    createBusinessType(data: {
        mainType: MainType;
        name: string;
        description?: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        mainType: import(".prisma/client").$Enums.MainType;
        isActive: boolean;
    }>;
    getSectors(businessTypeId?: string): Promise<({
        businessType: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            mainType: import(".prisma/client").$Enums.MainType;
            isActive: boolean;
        };
        categories: {
            workflow: string | null;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            parameters: import("@prisma/client/runtime/library").JsonValue | null;
            theme: string | null;
            icon: string | null;
            primaryType: string | null;
            allowedListingTypes: string[];
            businessModels: string[];
            workflowId: string | null;
            allowedFeatures: string[];
            notApplicable: string[];
            optionalFeatures: string[];
            subcategories: import("@prisma/client/runtime/library").JsonValue | null;
            defaultCommissionRate: number | null;
            defaultFlatRate: number | null;
            parentId: string | null;
            sectorId: string | null;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        parameters: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
        businessTypeId: string;
    })[]>;
    createSector(data: {
        businessTypeId: string;
        name: string;
        description?: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        parameters: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
        businessTypeId: string;
    }>;
    updateSector(id: string, data: {
        isActive?: boolean;
        name?: string;
        description?: string;
        parameters?: any;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        parameters: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
        businessTypeId: string;
    }>;
    getCategories(sectorId?: string): Promise<{
        workflow: string | null;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        parameters: import("@prisma/client/runtime/library").JsonValue | null;
        theme: string | null;
        icon: string | null;
        primaryType: string | null;
        allowedListingTypes: string[];
        businessModels: string[];
        workflowId: string | null;
        allowedFeatures: string[];
        notApplicable: string[];
        optionalFeatures: string[];
        subcategories: import("@prisma/client/runtime/library").JsonValue | null;
        defaultCommissionRate: number | null;
        defaultFlatRate: number | null;
        parentId: string | null;
        sectorId: string | null;
    }[]>;
    createCategory(data: {
        sectorId: string;
        name: string;
        parentId?: string;
    }): Promise<{
        workflow: string | null;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        parameters: import("@prisma/client/runtime/library").JsonValue | null;
        theme: string | null;
        icon: string | null;
        primaryType: string | null;
        allowedListingTypes: string[];
        businessModels: string[];
        workflowId: string | null;
        allowedFeatures: string[];
        notApplicable: string[];
        optionalFeatures: string[];
        subcategories: import("@prisma/client/runtime/library").JsonValue | null;
        defaultCommissionRate: number | null;
        defaultFlatRate: number | null;
        parentId: string | null;
        sectorId: string | null;
    }>;
    getWorkflows(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        version: number;
        steps: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    createWorkflow(data: {
        name: string;
        description?: string;
        steps: any;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        version: number;
        steps: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getSystemSettings(): Promise<import("@prisma/client/runtime/library").JsonValue>;
    updateSystemSettings(data: any): Promise<{
        id: string;
        name: string;
        data: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        type: string;
        updatedAt: Date;
    }>;
}
