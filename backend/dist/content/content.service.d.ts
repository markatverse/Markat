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
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        slug: string;
        content: string;
    }[]>;
    getCmsPageById(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        slug: string;
        content: string;
    } | null>;
    createCmsPage(data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        slug: string;
        content: string;
    }>;
    updateCmsPage(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        slug: string;
        content: string;
    }>;
    deleteCmsPage(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        slug: string;
        content: string;
    }>;
    getBanners(): Promise<any>;
    getBannerById(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        imageUrl: string;
        linkUrl: string | null;
        position: string;
    } | null>;
    createBanner(data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        imageUrl: string;
        linkUrl: string | null;
        position: string;
    }>;
    updateBanner(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        imageUrl: string;
        linkUrl: string | null;
        position: string;
    }>;
    deleteBanner(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
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
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        linkUrl: string | null;
        position: string;
        mediaUrl: string | null;
        source: string | null;
    } | null>;
    createAdvertisement(data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        linkUrl: string | null;
        position: string;
        mediaUrl: string | null;
        source: string | null;
    }>;
    updateAdvertisement(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        linkUrl: string | null;
        position: string;
        mediaUrl: string | null;
        source: string | null;
    }>;
    deleteAdvertisement(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        linkUrl: string | null;
        position: string;
        mediaUrl: string | null;
        source: string | null;
    }>;
    getBlogPosts(): Promise<any>;
    getBlogPostById(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        slug: string;
        content: string;
        author: string | null;
        featuredImage: string | null;
        tags: string[];
    } | null>;
    createBlogPost(data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        slug: string;
        content: string;
        author: string | null;
        featuredImage: string | null;
        tags: string[];
    }>;
    updateBlogPost(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        slug: string;
        content: string;
        author: string | null;
        featuredImage: string | null;
        tags: string[];
    }>;
    deleteBlogPost(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        slug: string;
        content: string;
        author: string | null;
        featuredImage: string | null;
        tags: string[];
    }>;
    getSeoMetadata(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string;
        title: string;
        pageUrl: string;
        keywords: string | null;
    }[]>;
    getSeoMetadataById(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string;
        title: string;
        pageUrl: string;
        keywords: string | null;
    } | null>;
    createSeoMetadata(data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string;
        title: string;
        pageUrl: string;
        keywords: string | null;
    }>;
    updateSeoMetadata(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string;
        title: string;
        pageUrl: string;
        keywords: string | null;
    }>;
    deleteSeoMetadata(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string;
        title: string;
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
