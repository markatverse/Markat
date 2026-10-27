var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PrismaService_1;
import 'dotenv/config';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });
dotenv.config({ path: resolve(process.cwd(), '.env') });
dotenv.config({ path: resolve(process.cwd(), 'backend/.env') });
import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
let PrismaService = PrismaService_1 = class PrismaService extends PrismaClient {
    logger = new Logger(PrismaService_1.name);
    async onModuleInit() {
        this.logger.log('Establishing database connection...');
        await this.connectWithRetry();
    }
    async connectWithRetry(retries = 5, delay = 3000) {
        for (let i = 0; i < retries; i++) {
            try {
                await this.$connect();
                this.logger.log('Successfully connected to the database.');
                return;
            }
            catch (err) {
                this.logger.error(`Database connection failed, retrying in ${delay}ms... (${i + 1}/${retries})`, err.stack);
                if (i === retries - 1)
                    throw err;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Database connection closed.');
    }
};
PrismaService = PrismaService_1 = __decorate([
    Injectable()
], PrismaService);
export { PrismaService };
//# sourceMappingURL=prisma.service.js.map