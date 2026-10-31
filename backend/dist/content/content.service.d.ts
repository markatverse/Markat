import { PrismaService } from '../prisma.service.js';
export declare class ContentService {
    private prisma;
    private bannersCache;
    private adsCache;
    private blogCache;
    private layoutCache;
    constructor(prisma: PrismaService);
    getCmsPages(): Promise<{
        id: string;
        title: string;
        slug: string;
        content: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getCmsPageById(id: string): Promise<{
        id: string;
        title: string;
        slug: string;
        content: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    createCmsPage(data: any): Promise<{
        id: string;
        title: string;
        slug: string;
        content: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateCmsPage(id: string, data: any): Promise<{
        id: string;
        title: string;
        slug: string;
        content: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteCmsPage(id: string): Promise<{
        id: string;
        title: string;
        slug: string;
        content: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getBanners(): Promise<any>;
    getBannerById(id: string): Promise<{
        id: string;
        title: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string;
        linkUrl: string | null;
        position: string;
    } | null>;
    createBanner(data: any): Promise<{
        id: string;
        title: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string;
        linkUrl: string | null;
        position: string;
    }>;
    updateBanner(id: string, data: any): Promise<{
        id: string;
        title: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string;
        linkUrl: string | null;
        position: string;
    }>;
    deleteBanner(id: string): Promise<{
        id: string;
        title: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string;
        linkUrl: string | null;
        position: string;
    }>;
    getPublicAdsPolicy(): Promise<any>;
    setPublicAdsPolicy(policy: {
        mode: string;
        allowPublicAds?: boolean;
    }): Promise<{
        mode: string;
        allowPublicAds: boolean;
    }>;
    getAdvertisements(adminView?: boolean): Promise<any>;
    getAdvertisementById(id: string): Promise<{
        id: string;
        title: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        linkUrl: string | null;
        position: string;
        mediaUrl: string | null;
    } | null>;
    createAdvertisement(data: any): Promise<{
        id: string;
        title: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        linkUrl: string | null;
        position: string;
        mediaUrl: string | null;
    }>;
    updateAdvertisement(id: string, data: any): Promise<{
        id: string;
        title: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        linkUrl: string | null;
        position: string;
        mediaUrl: string | null;
    }>;
    deleteAdvertisement(id: string): Promise<{
        id: string;
        title: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        linkUrl: string | null;
        position: string;
        mediaUrl: string | null;
    }>;
    getBlogPosts(): Promise<any>;
    getBlogPostById(id: string): Promise<{
        id: string;
        title: string;
        slug: string;
        content: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        author: string | null;
        featuredImage: string | null;
        tags: string[];
    } | null>;
    createBlogPost(data: any): Promise<{
        id: string;
        title: string;
        slug: string;
        content: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        author: string | null;
        featuredImage: string | null;
        tags: string[];
    }>;
    updateBlogPost(id: string, data: any): Promise<{
        id: string;
        title: string;
        slug: string;
        content: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        author: string | null;
        featuredImage: string | null;
        tags: string[];
    }>;
    deleteBlogPost(id: string): Promise<{
        id: string;
        title: string;
        slug: string;
        content: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        author: string | null;
        featuredImage: string | null;
        tags: string[];
    }>;
    getSeoMetadata(): Promise<{
        id: string;
        title: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        pageUrl: string;
        keywords: string | null;
    }[]>;
    getSeoMetadataById(id: string): Promise<{
        id: string;
        title: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        pageUrl: string;
        keywords: string | null;
    } | null>;
    createSeoMetadata(data: any): Promise<{
        id: string;
        title: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        pageUrl: string;
        keywords: string | null;
    }>;
    updateSeoMetadata(id: string, data: any): Promise<{
        id: string;
        title: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        pageUrl: string;
        keywords: string | null;
    }>;
    deleteSeoMetadata(id: string): Promise<{
        id: string;
        title: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        pageUrl: string;
        keywords: string | null;
    }>;
    getHomepageLayout(): Promise<any>;
    updateHomepageLayout(sections: any[]): Promise<any[]>;
}
export declare const DEFAULT_HOMEPAGE_SECTIONS: {
    id: string;
    label: string;
    description: string;
    badge: string;
    category: string;
    visible: boolean;
    order: number;
}[];
