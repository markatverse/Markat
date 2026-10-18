var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
let ContentService = class ContentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCmsPages() {
        return this.prisma.cmsPage.findMany({ orderBy: { updatedAt: 'desc' } });
    }
    async getCmsPageById(id) {
        return this.prisma.cmsPage.findUnique({ where: { id } });
    }
    async createCmsPage(data) {
        return this.prisma.cmsPage.create({ data });
    }
    async updateCmsPage(id, data) {
        return this.prisma.cmsPage.update({ where: { id }, data });
    }
    async deleteCmsPage(id) {
        return this.prisma.cmsPage.delete({ where: { id } });
    }
    async getBanners() {
        try {
            const banners = await this.prisma.banner.findMany({ take: 100 });
            return (banners || []).sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
        }
        catch (err) {
            console.error('Error in getBanners:', err?.message || err);
            return [];
        }
    }
    async getBannerById(id) {
        try {
            return await this.prisma.banner.findUnique({ where: { id } });
        }
        catch (err) {
            console.error('Error in getBannerById:', err?.message || err);
            return null;
        }
    }
    async createBanner(data) {
        try {
            return await this.prisma.banner.create({ data });
        }
        catch (err) {
            console.error('Error in createBanner:', err?.message || err);
            throw err;
        }
    }
    async updateBanner(id, data) {
        return this.prisma.banner.update({ where: { id }, data });
    }
    async deleteBanner(id) {
        return this.prisma.banner.delete({ where: { id } });
    }
    async getAdvertisements() {
        try {
            const ads = await this.prisma.advertisement.findMany({ take: 100 });
            return (ads || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        catch (err) {
            console.error('Error in ContentService.getAdvertisements:', err?.message || err);
            return [];
        }
    }
    async getAdvertisementById(id) {
        try {
            return await this.prisma.advertisement.findUnique({ where: { id } });
        }
        catch (err) {
            console.error('Error in ContentService.getAdvertisementById:', err?.message || err);
            return null;
        }
    }
    async createAdvertisement(data) {
        try {
            return await this.prisma.advertisement.create({ data });
        }
        catch (err) {
            console.error('Error in ContentService.createAdvertisement:', err?.message || err);
            throw err;
        }
    }
    async updateAdvertisement(id, data) {
        return this.prisma.advertisement.update({ where: { id }, data });
    }
    async deleteAdvertisement(id) {
        return this.prisma.advertisement.delete({ where: { id } });
    }
    async getBlogPosts() {
        return this.prisma.blogPost.findMany({ orderBy: { updatedAt: 'desc' }, take: 5 });
    }
    async getBlogPostById(id) {
        return this.prisma.blogPost.findUnique({ where: { id } });
    }
    async createBlogPost(data) {
        return this.prisma.blogPost.create({ data });
    }
    async updateBlogPost(id, data) {
        return this.prisma.blogPost.update({ where: { id }, data });
    }
    async deleteBlogPost(id) {
        return this.prisma.blogPost.delete({ where: { id } });
    }
    async getSeoMetadata() {
        return this.prisma.seoMetadata.findMany({ orderBy: { updatedAt: 'desc' } });
    }
    async getSeoMetadataById(id) {
        return this.prisma.seoMetadata.findUnique({ where: { id } });
    }
    async createSeoMetadata(data) {
        return this.prisma.seoMetadata.create({ data });
    }
    async updateSeoMetadata(id, data) {
        return this.prisma.seoMetadata.update({ where: { id }, data });
    }
    async deleteSeoMetadata(id) {
        return this.prisma.seoMetadata.delete({ where: { id } });
    }
};
ContentService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], ContentService);
export { ContentService };
//# sourceMappingURL=content.service.js.map