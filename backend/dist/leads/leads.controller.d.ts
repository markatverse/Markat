import { LeadsService } from './leads.service.js';
export declare class LeadsController {
    private readonly leadsService;
    constructor(leadsService: LeadsService);
    create(data: any): import(".prisma/client").Prisma.Prisma__LeadClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        message: string;
        sellerId: string;
        buyerId: string;
        productId: string;
        quantityRequested: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAllForSeller(id: string): import(".prisma/client").Prisma.PrismaPromise<({
        product: {
            id: string;
            name: string;
            image: string | null;
        };
        buyer: {
            id: string;
            name: string;
            email: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        message: string;
        sellerId: string;
        buyerId: string;
        productId: string;
        quantityRequested: number;
    })[]>;
    findAllForBuyer(id: string): import(".prisma/client").Prisma.PrismaPromise<({
        product: {
            id: string;
            name: string;
            price: number;
            image: string | null;
        };
        seller: {
            id: string;
            name: string;
            email: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        message: string;
        sellerId: string;
        buyerId: string;
        productId: string;
        quantityRequested: number;
    })[]>;
    updateStatus(id: string, status: string): import(".prisma/client").Prisma.Prisma__LeadClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        message: string;
        sellerId: string;
        buyerId: string;
        productId: string;
        quantityRequested: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
