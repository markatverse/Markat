import { Controller, Post, Get, Param, Res, UseInterceptors, UploadedFiles, BadRequestException, NotFoundException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { existsSync, createReadStream } from 'fs';
import { join, extname } from 'path';

const MIME_MAP: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

@Controller()
export class UploadController {
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10))
  uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    const urls = files.map(file => `${baseUrl}/public/uploads/${file.filename}`);

    return {
      message: 'Files uploaded successfully',
      urls: urls,
      files: files.map(f => ({ filename: f.filename, size: f.size })),
    };
  }

  // Stream uploads reliably on Vercel Serverless and local dev
  @Get('public/uploads/:filename')
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    // Prevent directory traversal
    const safeFilename = filename.replace(/(\.\.[\/\\])+/g, '');

    // Search across known upload locations
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
      throw new NotFoundException(`File ${filename} not found`);
    }

    const ext = extname(safeFilename).toLowerCase();
    const contentType = MIME_MAP[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    createReadStream(filePath).pipe(res);
  }
}

