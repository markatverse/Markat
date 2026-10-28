import { ConfigurationService } from './configuration.service.js';
import { MainType } from '@prisma/client';
export declare class ConfigurationController {
    private readonly configService;
    constructor(configService: ConfigurationService);
    getBusinessTypes(mainType?: MainType): Promise<any>;
    createBusinessType(data: {
        mainType: MainType;
        name: string;
        description?: string;
    }): Promise<{
        id: string;
        mainType: import(".prisma/client").$Enums.MainType;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getSectors(businessTypeId?: string): Promise<any>;
    createSector(data: {
        businessTypeId: string;
        name: string;
        description?: string;
    }): Promise<{
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        businessTypeId: string;
        parameters: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    updateSector(id: string, data: {
        isActive?: boolean;
        name?: string;
        description?: string;
    }): Promise<{
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        businessTypeId: string;
        parameters: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    getCategories(sectorId?: string): Promise<{
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
        workflow: string | null;
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
        workflow: string | null;
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
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
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
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        version: number;
        steps: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getSystemSettings(): Promise<any>;
    updateSystemSettings(data: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue;
        type: string;
    }>;
}
