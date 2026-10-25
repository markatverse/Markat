var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContentService } from './content.service.js';
let ContentController = class ContentController {
    contentService;
    constructor(contentService) {
        this.contentService = contentService;
    }
    getCmsPages() {
        return this.contentService.getCmsPages();
    }
    getCmsPage(id) {
        return this.contentService.getCmsPageById(id);
    }
    createCmsPage(data) {
        return this.contentService.createCmsPage(data);
    }
    updateCmsPage(id, data) {
        return this.contentService.updateCmsPage(id, data);
    }
    deleteCmsPage(id) {
        return this.contentService.deleteCmsPage(id);
    }
    getBanners() {
        return this.contentService.getBanners();
    }
    getBanner(id) {
        return this.contentService.getBannerById(id);
    }
    createBanner(data) {
        return this.contentService.createBanner(data);
    }
    updateBanner(id, data) {
        return this.contentService.updateBanner(id, data);
    }
    deleteBanner(id) {
        return this.contentService.deleteBanner(id);
    }
    getAdvertisements() {
        return this.contentService.getAdvertisements();
    }
    getAdvertisement(id) {
        return this.contentService.getAdvertisementById(id);
    }
    createAdvertisement(data) {
        return this.contentService.createAdvertisement(data);
    }
    updateAdvertisement(id, data) {
        return this.contentService.updateAdvertisement(id, data);
    }
    deleteAdvertisement(id) {
        return this.contentService.deleteAdvertisement(id);
    }
    getBlogPosts() {
        return this.contentService.getBlogPosts();
    }
    getBlogPost(id) {
        return this.contentService.getBlogPostById(id);
    }
    createBlogPost(data) {
        return this.contentService.createBlogPost(data);
    }
    updateBlogPost(id, data) {
        return this.contentService.updateBlogPost(id, data);
    }
    deleteBlogPost(id) {
        return this.contentService.deleteBlogPost(id);
    }
    getSeoMetadata() {
        return this.contentService.getSeoMetadata();
    }
    getSeoMetadataById(id) {
        return this.contentService.getSeoMetadataById(id);
    }
    createSeoMetadata(data) {
        return this.contentService.createSeoMetadata(data);
    }
    updateSeoMetadata(id, data) {
        return this.contentService.updateSeoMetadata(id, data);
    }
    deleteSeoMetadata(id) {
        return this.contentService.deleteSeoMetadata(id);
    }
    getHomepageLayout() {
        return this.contentService.getHomepageLayout();
    }
    updateHomepageLayout(data) {
        const sections = Array.isArray(data) ? data : (data.sections || []);
        return this.contentService.updateHomepageLayout(sections);
    }
};
__decorate([
    Get('cms'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "getCmsPages", null);
__decorate([
    Get('cms/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "getCmsPage", null);
__decorate([
    Post('cms'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "createCmsPage", null);
__decorate([
    Patch('cms/:id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "updateCmsPage", null);
__decorate([
    Delete('cms/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "deleteCmsPage", null);
__decorate([
    Get('banners'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "getBanners", null);
__decorate([
    Get('banners/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "getBanner", null);
__decorate([
    Post('banners'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "createBanner", null);
__decorate([
    Patch('banners/:id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "updateBanner", null);
__decorate([
    Delete('banners/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "deleteBanner", null);
__decorate([
    Get('advertisements'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "getAdvertisements", null);
__decorate([
    Get('advertisements/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "getAdvertisement", null);
__decorate([
    Post('advertisements'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "createAdvertisement", null);
__decorate([
    Patch('advertisements/:id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "updateAdvertisement", null);
__decorate([
    Delete('advertisements/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "deleteAdvertisement", null);
__decorate([
    Get('blog'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "getBlogPosts", null);
__decorate([
    Get('blog/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "getBlogPost", null);
__decorate([
    Post('blog'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "createBlogPost", null);
__decorate([
    Patch('blog/:id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "updateBlogPost", null);
__decorate([
    Delete('blog/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "deleteBlogPost", null);
__decorate([
    Get('seo'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "getSeoMetadata", null);
__decorate([
    Get('seo/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "getSeoMetadataById", null);
__decorate([
    Post('seo'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "createSeoMetadata", null);
__decorate([
    Patch('seo/:id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "updateSeoMetadata", null);
__decorate([
    Delete('seo/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "deleteSeoMetadata", null);
__decorate([
    Get('homepage-layout'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "getHomepageLayout", null);
__decorate([
    Post('homepage-layout'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "updateHomepageLayout", null);
ContentController = __decorate([
    Controller('content'),
    __metadata("design:paramtypes", [ContentService])
], ContentController);
export { ContentController };
//# sourceMappingURL=content.controller.js.map