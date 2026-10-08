import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { join } from 'path';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
const expressApp = express();
expressApp.use('/public/uploads', express.static(join(process.cwd(), 'uploads')));
let cachedServer;
async function bootstrap() {
    if (!cachedServer) {
        const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
        app.enableCors({
            origin: true,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            credentials: true,
        });
        app.use(helmet());
        app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 1000,
            message: { message: 'Too many requests from this IP, please try again later.', statusCode: 429 },
            standardHeaders: true,
            legacyHeaders: false,
        });
        app.use(limiter);
        app.use(express.json({ limit: '50mb' }));
        app.use(express.urlencoded({ limit: '50mb', extended: true }));
        app.use(compression());
        await app.init();
        cachedServer = expressApp;
    }
    return cachedServer;
}
if (!process.env.VERCEL) {
    bootstrap().then((app) => {
        app.listen(process.env.PORT ?? 3001, '0.0.0.0', () => {
            console.log('Backend is running on port ' + (process.env.PORT ?? 3001));
        });
    });
}
export default async function handler(req, res) {
    const server = await bootstrap();
    return server(req, res);
}
//# sourceMappingURL=main.js.map