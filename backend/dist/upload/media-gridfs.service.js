var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MediaGridFSService_1;
import { Injectable, Logger } from '@nestjs/common';
import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
import { existsSync, readdirSync, createReadStream, statSync } from 'fs';
import { join, extname } from 'path';
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
let MediaGridFSService = MediaGridFSService_1 = class MediaGridFSService {
    logger = new Logger(MediaGridFSService_1.name);
    client = null;
    bucket = null;
    isConnected = false;
    async onModuleInit() {
        await this.connectWithRetry();
        this.migrateLocalUploadsToGridFS().catch((err) => {
            this.logger.warn(`Background migration warning: ${err.message}`);
        });
    }
    async connectWithRetry(retries = 3, delayMs = 3000) {
        const uri = process.env.DATABASE_URL;
        if (!uri) {
            this.logger.warn('DATABASE_URL is not defined. GridFS media service will operate in fallback mode.');
            return;
        }
        for (let i = 0; i < retries; i++) {
            try {
                this.client = new MongoClient(uri);
                await this.client.connect();
                const db = this.client.db();
                this.bucket = new GridFSBucket(db, { bucketName: 'media' });
                this.isConnected = true;
                this.logger.log('MongoDB GridFS media bucket initialized successfully.');
                return;
            }
            catch (err) {
                this.logger.error(`Failed to connect MongoDB GridFS (attempt ${i + 1}/${retries}): ${err.message}`);
                if (i < retries - 1) {
                    await new Promise((res) => setTimeout(res, delayMs));
                }
            }
        }
    }
    async onModuleDestroy() {
        if (this.client) {
            await this.client.close();
            this.isConnected = false;
            this.logger.log('MongoDB GridFS client connection closed.');
        }
    }
    async uploadFile(file) {
        if (!this.bucket) {
            throw new Error('MongoDB GridFS is not connected');
        }
        const ext = extname(file.originalname || file.filename || '').toLowerCase();
        const uniqueName = file.filename || `media-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        const contentType = file.mimetype || MIME_MAP[ext] || 'application/octet-stream';
        const uploadStream = this.bucket.openUploadStream(uniqueName, {
            metadata: {
                originalName: file.originalname,
                size: file.size,
                contentType,
                mimetype: contentType,
                uploadedAt: new Date(),
            },
        });
        return new Promise((resolve, reject) => {
            uploadStream.on('error', (err) => reject(err));
            uploadStream.on('finish', () => {
                resolve({
                    filename: uniqueName,
                    fileId: uploadStream.id ? uploadStream.id.toString() : '',
                    contentType,
                    size: file.size,
                });
            });
            if (file.buffer) {
                uploadStream.end(file.buffer);
            }
            else if (file.path && existsSync(file.path)) {
                createReadStream(file.path).pipe(uploadStream);
            }
            else {
                reject(new Error('File buffer or path missing from upload'));
            }
        });
    }
    async findFile(filenameOrId) {
        if (!this.bucket)
            return null;
        let query = { filename: filenameOrId };
        if (ObjectId.isValid(filenameOrId) && filenameOrId.length === 24) {
            query = { $or: [{ _id: new ObjectId(filenameOrId) }, { filename: filenameOrId }] };
        }
        const files = await this.bucket.find(query).limit(1).toArray();
        return files.length > 0 ? files[0] : null;
    }
    openDownloadStream(fileId, options) {
        if (!this.bucket) {
            throw new Error('MongoDB GridFS is not connected');
        }
        return this.bucket.openDownloadStream(fileId, options);
    }
    async migrateLocalUploadsToGridFS() {
        if (!this.bucket)
            return;
        const localDir = join(process.cwd(), 'uploads');
        if (!existsSync(localDir))
            return;
        const files = readdirSync(localDir);
        let migratedCount = 0;
        for (const filename of files) {
            const filePath = join(localDir, filename);
            const stats = statSync(filePath);
            if (!stats.isFile())
                continue;
            const existing = await this.findFile(filename);
            if (!existing) {
                const ext = extname(filename).toLowerCase();
                const contentType = MIME_MAP[ext] || 'application/octet-stream';
                await new Promise((resolve, reject) => {
                    const stream = this.bucket.openUploadStream(filename, {
                        metadata: {
                            originalName: filename,
                            size: stats.size,
                            contentType,
                            mimetype: contentType,
                            migratedFromLocal: true,
                            uploadedAt: new Date(),
                        },
                    });
                    createReadStream(filePath).pipe(stream);
                    stream.on('finish', () => {
                        migratedCount++;
                        resolve();
                    });
                    stream.on('error', (err) => reject(err));
                });
            }
        }
        if (migratedCount > 0) {
            this.logger.log(`Successfully migrated ${migratedCount} existing local files to MongoDB GridFS.`);
        }
    }
};
MediaGridFSService = MediaGridFSService_1 = __decorate([
    Injectable()
], MediaGridFSService);
export { MediaGridFSService };
//# sourceMappingURL=media-gridfs.service.js.map