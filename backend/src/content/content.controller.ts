import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContentService } from './content.service.js';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // --- CMS ---
  @Get('cms')
  getCmsPages() {
    return this.contentService.getCmsPages();
  }

  @Get('cms/:id')
  getCmsPage(@Param('id') id: string) {
    return this.contentService.getCmsPageById(id);
  }

  @Post('cms')
  createCmsPage(@Body() data: any) {
    return this.contentService.createCmsPage(data);
  }

  @Patch('cms/:id')
  updateCmsPage(@Param('id') id: string, @Body() data: any) {
    return this.contentService.updateCmsPage(id, data);
  }

  @Delete('cms/:id')
  deleteCmsPage(@Param('id') id: string) {
    return this.contentService.deleteCmsPage(id);
  }

  // --- Banners ---
  @Get('banners')
  getBanners() {
    return this.contentService.getBanners();
  }

  @Get('banners/:id')
  getBanner(@Param('id') id: string) {
    return this.contentService.getBannerById(id);
  }

  @Post('banners')
  createBanner(@Body() data: any) {
    return this.contentService.createBanner(data);
  }

  @Patch('banners/:id')
  updateBanner(@Param('id') id: string, @Body() data: any) {
    return this.contentService.updateBanner(id, data);
  }

  @Delete('banners/:id')
  deleteBanner(@Param('id') id: string) {
    return this.contentService.deleteBanner(id);
  }

  // --- Advertisements ---
  @Get('advertisements')
  getAdvertisements() {
    return this.contentService.getAdvertisements();
  }

  @Get('advertisements/:id')
  getAdvertisement(@Param('id') id: string) {
    return this.contentService.getAdvertisementById(id);
  }

  @Post('advertisements')
  createAdvertisement(@Body() data: any) {
    return this.contentService.createAdvertisement(data);
  }

  @Patch('advertisements/:id')
  updateAdvertisement(@Param('id') id: string, @Body() data: any) {
    return this.contentService.updateAdvertisement(id, data);
  }

  @Delete('advertisements/:id')
  deleteAdvertisement(@Param('id') id: string) {
    return this.contentService.deleteAdvertisement(id);
  }

  // --- Blog ---
  @Get('blog')
  getBlogPosts() {
    return this.contentService.getBlogPosts();
  }

  @Get('blog/:id')
  getBlogPost(@Param('id') id: string) {
    return this.contentService.getBlogPostById(id);
  }

  @Post('blog')
  createBlogPost(@Body() data: any) {
    return this.contentService.createBlogPost(data);
  }

  @Patch('blog/:id')
  updateBlogPost(@Param('id') id: string, @Body() data: any) {
    return this.contentService.updateBlogPost(id, data);
  }

  @Delete('blog/:id')
  deleteBlogPost(@Param('id') id: string) {
    return this.contentService.deleteBlogPost(id);
  }

  // --- SEO ---
  @Get('seo')
  getSeoMetadata() {
    return this.contentService.getSeoMetadata();
  }

  @Get('seo/:id')
  getSeoMetadataById(@Param('id') id: string) {
    return this.contentService.getSeoMetadataById(id);
  }

  @Post('seo')
  createSeoMetadata(@Body() data: any) {
    return this.contentService.createSeoMetadata(data);
  }

  @Patch('seo/:id')
  updateSeoMetadata(@Param('id') id: string, @Body() data: any) {
    return this.contentService.updateSeoMetadata(id, data);
  }

  @Delete('seo/:id')
  deleteSeoMetadata(@Param('id') id: string) {
    return this.contentService.deleteSeoMetadata(id);
  }
}
