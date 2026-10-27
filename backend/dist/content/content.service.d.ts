import { PrismaService } from '../prisma.service.js';
export declare class ContentService {
    private prisma;
    constructor(prisma: PrismaService);
    getCmsPages(): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        content: string;
    }[]>;
    getCmsPageById(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        content: string;
    } | null>;
    createCmsPage(data: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        content: string;
    }>;
    updateCmsPage(id: string, data: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        content: string;
    }>;
    deleteCmsPage(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        content: string;
    }>;
    getBanners(): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        imageUrl: string;
        linkUrl: string | null;
        position: string;
    }[]>;
    getBannerById(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        imageUrl: string;
        linkUrl: string | null;
        position: string;
    } | null>;
    createBanner(data: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        imageUrl: string;
        linkUrl: string | null;
        position: string;
    }>;
    updateBanner(id: string, data: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        imageUrl: string;
        linkUrl: string | null;
        position: string;
    }>;
    deleteBanner(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        imageUrl: string;
        linkUrl: string | null;
        position: string;
    }>;
    getAdvertisements(): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        linkUrl: string | null;
        position: string;
        mediaUrl: string | null;
    }[]>;
    getAdvertisementById(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        linkUrl: string | null;
        position: string;
        mediaUrl: string | null;
    } | null>;
    createAdvertisement(data: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        linkUrl: string | null;
        position: string;
        mediaUrl: string | null;
    }>;
    updateAdvertisement(id: string, data: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        linkUrl: string | null;
        position: string;
        mediaUrl: string | null;
    }>;
    deleteAdvertisement(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        linkUrl: string | null;
        position: string;
        mediaUrl: string | null;
    }>;
    getBlogPosts(): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        content: string;
        author: string | null;
        featuredImage: string | null;
        tags: string[];
    }[]>;
    getBlogPostById(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        content: string;
        author: string | null;
        featuredImage: string | null;
        tags: string[];
    } | null>;
    createBlogPost(data: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        content: string;
        author: string | null;
        featuredImage: string | null;
        tags: string[];
    }>;
    updateBlogPost(id: string, data: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        content: string;
        author: string | null;
        featuredImage: string | null;
        tags: string[];
    }>;
    deleteBlogPost(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        content: string;
        author: string | null;
        featuredImage: string | null;
        tags: string[];
    }>;
    getSeoMetadata(): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        title: string;
        pageUrl: string;
        keywords: string | null;
    }[]>;
    getSeoMetadataById(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        title: string;
        pageUrl: string;
        keywords: string | null;
    } | null>;
    createSeoMetadata(data: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        title: string;
        pageUrl: string;
        keywords: string | null;
    }>;
    updateSeoMetadata(id: string, data: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        title: string;
        pageUrl: string;
        keywords: string | null;
    }>;
    deleteSeoMetadata(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        title: string;
        pageUrl: string;
        keywords: string | null;
    }>;
    getHomepageLayout(): Promise<any[]>;
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
