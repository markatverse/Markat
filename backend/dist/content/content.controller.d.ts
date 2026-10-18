import { ContentService } from './content.service.js';
export declare class ContentController {
    private readonly contentService;
    constructor(contentService: ContentService);
    getCmsPages(): Promise<{
        id: string;
        title: string;
        slug: string;
        content: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getCmsPage(id: string): Promise<{
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
    getBanners(): Promise<{
        id: string;
        title: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string;
        linkUrl: string | null;
        position: string;
    }[]>;
    getBanner(id: string): Promise<{
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
    getAdvertisements(): Promise<{
        id: string;
        title: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        linkUrl: string | null;
        position: string;
        mediaUrl: string | null;
    }[]>;
    getAdvertisement(id: string): Promise<{
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
    getBlogPosts(): Promise<{
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
    }[]>;
    getBlogPost(id: string): Promise<{
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
        pageUrl: string;
        description: string;
        keywords: string | null;
    }[]>;
    getSeoMetadataById(id: string): Promise<{
        id: string;
        title: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        pageUrl: string;
        description: string;
        keywords: string | null;
    } | null>;
    createSeoMetadata(data: any): Promise<{
        id: string;
        title: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        pageUrl: string;
        description: string;
        keywords: string | null;
    }>;
    updateSeoMetadata(id: string, data: any): Promise<{
        id: string;
        title: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        pageUrl: string;
        description: string;
        keywords: string | null;
    }>;
    deleteSeoMetadata(id: string): Promise<{
        id: string;
        title: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        pageUrl: string;
        description: string;
        keywords: string | null;
    }>;
}
