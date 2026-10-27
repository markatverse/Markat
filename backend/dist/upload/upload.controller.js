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
var UploadController_1;
import { Controller, Post, Get, Param, Res, Req, UseInterceptors, UploadedFiles, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { existsSync, createReadStream, statSync } from 'fs';
import { join, extname } from 'path';
import { MediaGridFSService } from './media-gridfs.service.js';
const MIME_MAP = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ogg': 'video/ogg',
    '.mov': 'video/quicktime',
    '.pdf': 'application/pdf',
};
let UploadController = UploadController_1 = class UploadController {
    gridFsService;
    logger = new Logger(UploadController_1.name);
    constructor(gridFsService) {
        this.gridFsService = gridFsService;
    }
    async uploadFiles(files, req) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files uploaded');
        }
        const host = req.get('host') || 'localhost:3001';
        const protocol = req.protocol || 'http';
        const cdnBase = process.env.CDN_URL
            ? process.env.CDN_URL.replace(/\/$/, '')
            : (process.env.BASE_URL || `${protocol}://${host}`);
        const uploadedResults = await Promise.all(files.map(async (file) => {
            try {
                const result = await this.gridFsService.uploadFile(file);
                return {
                    filename: result.filename,
                    fileId: result.fileId,
                    size: result.size,
                    contentType: result.contentType,
                    url: `${cdnBase}/media/${result.filename}`,
                };
            }
            catch (err) {
                this.logger.error(`Failed to store file ${file.originalname} in MongoDB: ${err.message}`);
                const ext = extname(file.originalname).toLowerCase();
                const fallbackName = file.filename || `media-${Date.now()}${ext}`;
                return {
                    filename: fallbackName,
                    fileId: '',
                    size: file.size,
                    contentType: file.mimetype,
                    url: `${cdnBase}/public/uploads/${fallbackName}`,
                };
            }
        }));
        return {
            message: 'Files uploaded and stored successfully in MongoDB GridFS',
            storage: 'mongodb-gridfs',
            urls: uploadedResults.map((r) => r.url),
            files: uploadedResults,
        };
    }
    async serveMedia(filename, req, res) {
        const safeFilename = filename.replace(/(\.\.[\/\\])+/g, '');
        try {
            const gridFile = await this.gridFsService.findFile(safeFilename);
            if (gridFile) {
                const fileMeta = gridFile.metadata;
                const contentType = fileMeta?.contentType ||
                    fileMeta?.mimetype ||
                    MIME_MAP[extname(safeFilename).toLowerCase()] ||
                    'application/octet-stream';
                const fileLength = gridFile.length;
                const etag = `"${gridFile._id.toString()}"`;
                res.setHeader('Content-Type', contentType);
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
                res.setHeader('Accept-Ranges', 'bytes');
                res.setHeader('ETag', etag);
                if (req.headers['if-none-match'] === etag) {
                    return res.status(304).end();
                }
                const rangeHeader = req.headers.range;
                if (rangeHeader && rangeHeader.startsWith('bytes=')) {
                    const parts = rangeHeader.replace(/bytes=/, '').split('-');
                    const start = parseInt(parts[0], 10);
                    const end = parts[1] ? parseInt(parts[1], 10) : fileLength - 1;
                    if (start >= fileLength || end >= fileLength) {
                        res.setHeader('Content-Range', `bytes */${fileLength}`);
                        return res.status(416).end();
                    }
                    const chunkSize = end - start + 1;
                    res.status(206);
                    res.setHeader('Content-Range', `bytes ${start}-${end}/${fileLength}`);
                    res.setHeader('Content-Length', chunkSize);
                    const stream = this.gridFsService.openDownloadStream(gridFile._id, {
                        start,
                        end: end + 1,
                    });
                    return stream.pipe(res);
                }
                res.status(200);
                res.setHeader('Content-Length', fileLength);
                const stream = this.gridFsService.openDownloadStream(gridFile._id);
                return stream.pipe(res);
            }
        }
        catch (err) {
            this.logger.warn(`GridFS retrieval error for ${safeFilename}: ${err.message}`);
        }
        const candidatePaths = [
            join(process.cwd(), 'uploads', safeFilename),
            join(process.cwd(), 'dist', 'uploads', safeFilename),
            join('/tmp', safeFilename),
        ];
        let filePath = null;
        for (const p of candidatePaths) {
            if (existsSync(p)) {
                filePath = p;
                break;
            }
        }
        if (!filePath) {
            throw new NotFoundException(`Media file ${filename} not found`);
        }
        const ext = extname(safeFilename).toLowerCase();
        const contentType = MIME_MAP[ext] || 'application/octet-stream';
        const stats = statSync(filePath);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
        res.setHeader('Content-Length', stats.size);
        createReadStream(filePath).pipe(res);
    }
};
__decorate([
    Post('upload'),
    UseInterceptors(FilesInterceptor('files', 10, {
        limits: { fileSize: 50 * 1024 * 1024 }
    })),
    __param(0, UploadedFiles()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadFiles", null);
__decorate([
    Get([
        'media/:filename',
        'cdn/media/:filename',
        'public/uploads/:filename',
        'uploads/:filename'
    ]),
    __param(0, Param('filename')),
    __param(1, Req()),
    __param(2, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "serveMedia", null);
UploadController = UploadController_1 = __decorate([
    Controller(),
    __metadata("design:paramtypes", [MediaGridFSService])
], UploadController);
export { UploadController };
//# sourceMappingURL=upload.controller.js.map