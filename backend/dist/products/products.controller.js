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
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductsService } from './products.service.js';
let ProductsController = class ProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    create(data) {
        return this.productsService.create(data);
    }
    findAll(location, lat, lng, radius, page, limit, q, search, category, subcategory, type, isB2B, filter, b2b, minPrice, maxPrice, sortBy) {
        return this.productsService.findAll(location, lat ? parseFloat(lat) : undefined, lng ? parseFloat(lng) : undefined, radius ? parseFloat(radius) : undefined, page ? parseInt(page) : 1, limit ? parseInt(limit) : 50, {
            q: q || search,
            category,
            subcategory,
            type,
            isB2B: isB2B !== undefined ? isB2B === 'true' : (b2b === 'true' || filter === 'b2b' ? true : undefined),
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            sortBy,
        });
    }
    getDummyStatus() {
        return this.productsService.getDummyStatus();
    }
    findOne(id) {
        return this.productsService.findOne(id);
    }
    toggleDummy(enable) {
        return this.productsService.toggleDummyData(enable);
    }
    updateAdminStatus(id, status) {
        return this.productsService.updateAdminStatus(id, status);
    }
    update(id, data) {
        return this.productsService.update(id, data);
    }
    remove(id) {
        return this.productsService.remove(id);
    }
};
__decorate([
    Post(),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "create", null);
__decorate([
    Get(),
    __param(0, Query('location')),
    __param(1, Query('lat')),
    __param(2, Query('lng')),
    __param(3, Query('radius')),
    __param(4, Query('page')),
    __param(5, Query('limit')),
    __param(6, Query('q')),
    __param(7, Query('search')),
    __param(8, Query('category')),
    __param(9, Query('subcategory')),
    __param(10, Query('type')),
    __param(11, Query('isB2B')),
    __param(12, Query('filter')),
    __param(13, Query('b2b')),
    __param(14, Query('minPrice')),
    __param(15, Query('maxPrice')),
    __param(16, Query('sortBy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAll", null);
__decorate([
    Get('dummy-status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "getDummyStatus", null);
__decorate([
    Get(':id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findOne", null);
__decorate([
    Post('toggle-dummy'),
    __param(0, Body('enable')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "toggleDummy", null);
__decorate([
    Patch(':id/admin-status'),
    __param(0, Param('id')),
    __param(1, Body('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "updateAdminStatus", null);
__decorate([
    Patch(':id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "update", null);
__decorate([
    Delete(':id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "remove", null);
ProductsController = __decorate([
    Controller('products'),
    __metadata("design:paramtypes", [ProductsService])
], ProductsController);
export { ProductsController };
//# sourceMappingURL=products.controller.js.map