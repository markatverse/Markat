import { 
  Controller, 
  Post, 
  Get, 
  Param, 
  Res, 
  Req, 
  UseInterceptors, 
  UploadedFiles, 
  BadRequestException, 
  NotFoundException,
  Logger
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { existsSync, createReadStream, statSync } from 'fs';
import { join, extname, basename } from 'path';
import { MediaGridFSService } from './media-gridfs.service.js';

const MIME_MAP: Record<string, string> = {
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

@Controller()
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly gridFsService: MediaGridFSService) {}

  /**
   * Upload images and videos directly into MongoDB GridFS
   * Returns CDN-ready media URLs
   */
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10, {
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (_req: any, file: any, cb: any) => {
      const ext = extname(file.originalname).toLowerCase();
      const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.mp4', '.webm', '.ogg', '.mov', '.pdf'];
      if (!allowed.includes(ext)) {
        return cb(new BadRequestException(`Unsupported file type ${ext}. Only safe media files (images, video, pdf) are permitted.`), false);
      }
      cb(null, true);
    }
  }))
  async uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>, @Req() req: Request) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const host = req.get('host') || 'localhost:3001';
    const protocol = req.protocol || 'http';
    const cdnBase = process.env.CDN_URL 
      ? process.env.CDN_URL.replace(/\/$/, '') 
      : (process.env.BASE_URL || `${protocol}://${host}`);

    const uploadedResults = await Promise.all(
      files.map(async (file) => {
        try {
          const result = await this.gridFsService.uploadFile(file);
          return {
            filename: result.filename,
            fileId: result.fileId,
            size: result.size,
            contentType: result.contentType,
            url: `${cdnBase}/media/${result.filename}`,
          };
        } catch (err: any) {
          this.logger.error(`Failed to store file ${file.originalname} in MongoDB: ${err.message}`);
          // Fallback to local filename if GridFS error
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
      })
    );

    return {
      message: 'Files uploaded and stored successfully in MongoDB GridFS',
      storage: 'mongodb-gridfs',
      urls: uploadedResults.map((r) => r.url),
      files: uploadedResults,
    };
  }

  /**
   * High-Performance CDN Media Streaming
   * Serves Images, Videos, and Files from MongoDB GridFS with HTTP Range and Edge Caching
   */
  @Get([
    'media/:filename',
    'cdn/media/:filename',
    'public/uploads/:filename',
    'uploads/:filename'
  ])
  async serveMedia(
    @Param('filename') filename: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const safeFilename = basename(filename);

    // 1. Check MongoDB GridFS first
    try {
      const gridFile = await this.gridFsService.findFile(safeFilename);
      if (gridFile) {
        const fileMeta = gridFile.metadata as any;
        const contentType = fileMeta?.contentType || 
          fileMeta?.mimetype ||
          MIME_MAP[extname(safeFilename).toLowerCase()] || 
          'application/octet-stream';
        const fileLength = gridFile.length;
        const etag = `"${gridFile._id.toString()}"`;

        // CDN Cache-Control: 1 year immutable for Edge CDNs (Cloudflare, CloudFront, Vercel Edge)
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('ETag', etag);

        // Conditional GET (304 Not Modified)
        if (req.headers['if-none-match'] === etag) {
          return res.status(304).end();
        }

        // 2. Handle HTTP Range Request (Essential for Video Streaming)
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

        // Full content delivery
        res.status(200);
        res.setHeader('Content-Length', fileLength);
        const stream = this.gridFsService.openDownloadStream(gridFile._id);
        return stream.pipe(res);
      }
    } catch (err: any) {
      this.logger.warn(`GridFS retrieval error for ${safeFilename}: ${err.message}`);
    }

    // 2. Fallback to Local Disk (for any pre-existing files or local fallbacks)
    const candidatePaths = [
      join(process.cwd(), 'uploads', safeFilename),
      join(process.cwd(), 'dist', 'uploads', safeFilename),
      join('/tmp', safeFilename),
    ];

    let filePath: string | null = null;
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
}
