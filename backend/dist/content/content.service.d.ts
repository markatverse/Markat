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
}
