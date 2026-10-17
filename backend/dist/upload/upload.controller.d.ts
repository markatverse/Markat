import type { Response } from 'express';
export declare class UploadController {
    uploadFiles(files: Array<Express.Multer.File>): {
        message: string;
        urls: string[];
        files: {
            filename: string;
            size: number;
        }[];
    };
    serveFile(filename: string, res: Response): void;
}
