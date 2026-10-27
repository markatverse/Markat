import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import type { Readable } from 'stream';
export declare class MediaGridFSService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private client;
    private bucket;
    private isConnected;
    onModuleInit(): Promise<void>;
    private connectWithRetry;
    onModuleDestroy(): Promise<void>;
    uploadFile(file: Express.Multer.File): Promise<{
        filename: string;
        fileId: string;
        contentType: string;
        size: number;
    }>;
    findFile(filenameOrId: string): Promise<import("mongodb").GridFSFile | null>;
    openDownloadStream(fileId: ObjectId, options?: {
        start?: number;
        end?: number;
    }): Readable;
    private migrateLocalUploadsToGridFS;
}
