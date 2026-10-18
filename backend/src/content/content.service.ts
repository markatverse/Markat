import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  // --- CMS Pages ---
  async getCmsPages() {
    return this.prisma.cmsPage.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async getCmsPageById(id: string) {
    return this.prisma.cmsPage.findUnique({ where: { id } });
  }

  async createCmsPage(data: any) {
    return this.prisma.cmsPage.create({ data });
  }

  async updateCmsPage(id: string, data: any) {
    return this.prisma.cmsPage.update({ where: { id }, data });
  }

  async deleteCmsPage(id: string) {
    return this.prisma.cmsPage.delete({ where: { id } });
  }

  // --- Banners ---
  async getBanners() {
    try {
      const banners = await this.prisma.banner.findMany({ take: 100 });
      return (banners || []).sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
    } catch (err: any) {
      console.error('Error in getBanners:', err?.message || err);
      return [];
    }
  }

  async getBannerById(id: string) {
    try {
      return await this.prisma.banner.findUnique({ where: { id } });
    } catch (err: any) {
      console.error('Error in getBannerById:', err?.message || err);
      return null;
    }
  }

  async createBanner(data: any) {
    try {
      return await this.prisma.banner.create({ data });
    } catch (err: any) {
      console.error('Error in createBanner:', err?.message || err);
      throw err;
    }
  }

  async updateBanner(id: string, data: any) {
    return this.prisma.banner.update({ where: { id }, data });
  }

  async deleteBanner(id: string) {
    return this.prisma.banner.delete({ where: { id } });
  }

  // --- Advertisements ---
  async getAdvertisements() {
    try {
      const ads = await this.prisma.advertisement.findMany({ take: 100 });
      return (ads || []).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err: any) {
      console.error('Error in ContentService.getAdvertisements:', err?.message || err);
      return [];
    }
  }

  async getAdvertisementById(id: string) {
    try {
      return await this.prisma.advertisement.findUnique({ where: { id } });
    } catch (err: any) {
      console.error('Error in ContentService.getAdvertisementById:', err?.message || err);
      return null;
    }
  }

  async createAdvertisement(data: any) {
    try {
      return await this.prisma.advertisement.create({ data });
    } catch (err: any) {
      console.error('Error in ContentService.createAdvertisement:', err?.message || err);
      throw err;
    }
  }

  async updateAdvertisement(id: string, data: any) {
    return this.prisma.advertisement.update({ where: { id }, data });
  }

  async deleteAdvertisement(id: string) {
    return this.prisma.advertisement.delete({ where: { id } });
  }

  // --- Blog Posts ---
  async getBlogPosts() {
    return this.prisma.blogPost.findMany({ orderBy: { updatedAt: 'desc' }, take: 5 });
  }

  async getBlogPostById(id: string) {
    return this.prisma.blogPost.findUnique({ where: { id } });
  }

  async createBlogPost(data: any) {
    return this.prisma.blogPost.create({ data });
  }

  async updateBlogPost(id: string, data: any) {
    return this.prisma.blogPost.update({ where: { id }, data });
  }

  async deleteBlogPost(id: string) {
    return this.prisma.blogPost.delete({ where: { id } });
  }

  // --- SEO Metadata ---
  async getSeoMetadata() {
    return this.prisma.seoMetadata.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async getSeoMetadataById(id: string) {
    return this.prisma.seoMetadata.findUnique({ where: { id } });
  }

  async createSeoMetadata(data: any) {
    return this.prisma.seoMetadata.create({ data });
  }

  async updateSeoMetadata(id: string, data: any) {
    return this.prisma.seoMetadata.update({ where: { id }, data });
  }

  async deleteSeoMetadata(id: string) {
    return this.prisma.seoMetadata.delete({ where: { id } });
  }
}
