import type { Request, Response } from 'express';
import { MediaGridFSService } from './media-gridfs.service.js';
export declare class UploadController {
    private readonly gridFsService;
    private readonly logger;
    constructor(gridFsService: MediaGridFSService);
    uploadFiles(files: Array<Express.Multer.File>, req: Request): Promise<{
        message: string;
        storage: string;
        urls: string[];
        files: {
            filename: string;
            fileId: string;
            size: number;
            contentType: string;
            url: string;
        }[];
    }>;
    serveMedia(filename: string, req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
