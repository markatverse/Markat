import { ContentService } from './content.service.js';
export declare class ContentController {
    private readonly contentService;
    constructor(contentService: ContentService);
    getCmsPages(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        slug: string;
        content: string;
    }[]>;
    getCmsPage(id: string): Promise<{
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
    getBanner(id: string): Promise<{
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
    setPublicAdsPolicy(body: any): Promise<{
        mode: string;
        allowPublicAds: boolean;
    }>;
    getAdvertisements(): Promise<any>;
    getAllAdvertisementsForAdmin(): Promise<any>;
    getAdvertisement(id: string): Promise<{
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
    getBlogPost(id: string): Promise<{
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
    updateHomepageLayout(data: any): Promise<any[]>;
}
