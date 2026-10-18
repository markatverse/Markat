var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller.js';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
const uploadDir = process.env.VERCEL ? '/tmp' : './uploads';
if (!existsSync(uploadDir)) {
    try {
        mkdirSync(uploadDir, { recursive: true });
    }
    catch { }
}
let UploadModule = class UploadModule {
};
UploadModule = __decorate([
    Module({
        imports: [
            MulterModule.register({
                storage: diskStorage({
                    destination: (req, file, cb) => {
                        if (!existsSync(uploadDir)) {
                            try {
                                mkdirSync(uploadDir, { recursive: true });
                            }
                            catch { }
                        }
                        cb(null, uploadDir);
                    },
                    filename: (req, file, cb) => {
                        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                        const ext = extname(file.originalname);
                        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
                    },
                }),
                limits: {
                    fileSize: 10 * 1024 * 1024,
                },
            }),
        ],
        controllers: [UploadController],
    })
], UploadModule);
export { UploadModule };
//# sourceMappingURL=upload.module.js.map