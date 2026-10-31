import { ProductsService } from './products.service.js';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(data: any): Promise<any>;
    findAll(location?: string, lat?: string, lng?: string, radius?: string, page?: string, limit?: string, q?: string, search?: string, category?: string, subcategory?: string, type?: string, isB2B?: string, filter?: string, b2b?: string, minPrice?: string, maxPrice?: string, sortBy?: string): Promise<any>;
    getDummyStatus(): Promise<{
        enabled: boolean;
    }>;
    findOne(id: string): Promise<any>;
    toggleDummy(enable: boolean): Promise<{
        success: boolean;
        message: string;
    }>;
    updateAdminStatus(id: string, status: string): Promise<any>;
    update(id: string, data: any): Promise<any>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
