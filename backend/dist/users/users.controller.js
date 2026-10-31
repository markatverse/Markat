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
import { Controller, Get, Post, Body, Patch, Param, Delete, Headers, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
let UsersController = class UsersController {
    usersService;
    jwtService;
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    authenticateOwner(userId, authorization) {
        const claims = this.authenticateToken(authorization);
        if (claims.sub !== userId)
            throw new ForbiddenException('Access denied');
        return claims;
    }
    authenticateToken(authorization) {
        const token = authorization?.startsWith('Bearer ')
            ? authorization.slice(7)
            : undefined;
        if (!token)
            throw new UnauthorizedException('Authentication required');
        try {
            const claims = this.jwtService.verify(token);
            if (!claims.sub)
                throw new UnauthorizedException('Invalid or expired session');
            return claims;
        }
        catch {
            throw new UnauthorizedException('Invalid or expired session');
        }
    }
    create(createUserDto) {
        return this.usersService.create(createUserDto);
    }
    findAll(authorization) {
        const claims = this.authenticateToken(authorization);
        if (claims.role !== 'ADMIN' && claims.role !== 'SUPER_ADMIN') {
            throw new ForbiddenException('Admin privileges required to view user directory');
        }
        return this.usersService.findAll();
    }
    findOne(id, authorization) {
        const claims = this.authenticateToken(authorization);
        if (claims.sub !== id && claims.role !== 'ADMIN' && claims.role !== 'SUPER_ADMIN') {
            throw new ForbiddenException('Access denied');
        }
        return this.usersService.findOne(id);
    }
    async update(id, updateUserDto, authorization) {
        const actor = this.authenticateToken(authorization);
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes((await this.usersService.findRole(actor.sub))?.toUpperCase() || '');
        if (actor.sub !== id && !isAdmin)
            throw new ForbiddenException('Access denied');
        const profileData = {
            name: updateUserDto.name,
            email: updateUserDto.email,
            phone: updateUserDto.phone,
        };
        return this.usersService.update(id, isAdmin ? updateUserDto : profileData);
    }
    async updatePassword(id, body, authorization) {
        this.authenticateOwner(id, authorization);
        return this.usersService.updatePassword(id, body.currentPassword, body.newPassword);
    }
    remove(id, authorization) {
        const claims = this.authenticateToken(authorization);
        if (claims.sub !== id && claims.role !== 'ADMIN' && claims.role !== 'SUPER_ADMIN') {
            throw new ForbiddenException('Admin access required to delete accounts');
        }
        return this.usersService.remove(id);
    }
    async getAddresses(id, authorization) {
        this.authenticateOwner(id, authorization);
        return this.usersService.getAddresses(id);
    }
    async addAddress(id, body, authorization) {
        this.authenticateOwner(id, authorization);
        return this.usersService.addAddress(id, body);
    }
    async updateAddress(addressId, body, authorization) {
        const userId = this.authenticateToken(authorization).sub;
        return this.usersService.updateAddress(userId, addressId, body);
    }
    deleteAddress(addressId, authorization) {
        const userId = this.authenticateToken(authorization).sub;
        return this.usersService.deleteAddress(userId, addressId);
    }
};
__decorate([
    Post(),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "create", null);
__decorate([
    Get(),
    __param(0, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
__decorate([
    Get(':id'),
    __param(0, Param('id')),
    __param(1, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    Patch(':id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    Patch(':id/password'),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updatePassword", null);
__decorate([
    Delete(':id'),
    __param(0, Param('id')),
    __param(1, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "remove", null);
__decorate([
    Get(':id/addresses'),
    __param(0, Param('id')),
    __param(1, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAddresses", null);
__decorate([
    Post(':id/addresses'),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "addAddress", null);
__decorate([
    Patch('addresses/:addressId'),
    __param(0, Param('addressId')),
    __param(1, Body()),
    __param(2, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateAddress", null);
__decorate([
    Delete('addresses/:addressId'),
    __param(0, Param('addressId')),
    __param(1, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "deleteAddress", null);
UsersController = __decorate([
    Controller('users'),
    __metadata("design:paramtypes", [UsersService,
        JwtService])
], UsersController);
export { UsersController };
//# sourceMappingURL=users.controller.js.map