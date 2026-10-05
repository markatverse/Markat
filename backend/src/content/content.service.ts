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
    return this.prisma.banner.findMany({ orderBy: { updatedAt: 'desc' }, take: 5 });
  }

  async getBannerById(id: string) {
    return this.prisma.banner.findUnique({ where: { id } });
  }

  async createBanner(data: any) {
    return this.prisma.banner.create({ data });
  }

  async updateBanner(id: string, data: any) {
    return this.prisma.banner.update({ where: { id }, data });
  }

  async deleteBanner(id: string) {
    return this.prisma.banner.delete({ where: { id } });
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
