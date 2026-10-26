import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { join } from 'path';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
const expressApp = express();
const BAD_BOT_PATTERNS = [
    /sqlmap/i,
    /nikto/i,
    /acunetix/i,
    /havij/i,
    /nmap/i,
    /masscan/i,
    /python-requests/i,
    /go-http-client/i,
    /wget/i,
    /headlesschrome/i,
    /phantomjs/i,
    /zgrab/i,
];
const MALICIOUS_PATH_PATTERNS = [
    /\.env/i,
    /\.git/i,
    /wp-admin/i,
    /wp-login/i,
    /phpmyadmin/i,
    /\.php$/i,
    /\.sql$/i,
    /\/actuator\//i,
    /\/cgi-bin\//i,
    /\.\.\//,
    /<script.*?>/i,
];
expressApp.use((req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    const url = req.url || '';
    for (const pattern of MALICIOUS_PATH_PATTERNS) {
        if (pattern.test(url)) {
            return res.status(403).json({
                statusCode: 403,
                message: 'Forbidden: Request path matched security inspection policy',
            });
        }
    }
    const isLocal = req.headers.host?.includes('localhost') || req.headers.host?.includes('127.0.0.1');
    if (!isLocal) {
        for (const botRegex of BAD_BOT_PATTERNS) {
            if (botRegex.test(userAgent)) {
                return res.status(403).json({
                    statusCode: 403,
                    message: 'Forbidden: Automated scanner blocked by MarkatVerse Bot Defense',
                });
            }
        }
    }
    next();
});
expressApp.use('/public/uploads', express.static(join(process.cwd(), 'uploads')));
let cachedServer;
async function bootstrap() {
    if (!cachedServer) {
        const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
        const allowedOrigins = process.env.ALLOWED_ORIGINS
            ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
            : ['http://localhost:3000', 'http://127.0.0.1:3000'];
        app.enableCors({
            origin: (origin, callback) => {
                if (!origin) {
                    return callback(null, true);
                }
                const cleanOrigin = origin.replace(/\/$/, '').toLowerCase();
                const isAllowedOrigin = allowedOrigins.some(o => o.replace(/\/$/, '').toLowerCase() === cleanOrigin);
                const isMarkatVerse = cleanOrigin === 'https://markatverse.com' ||
                    cleanOrigin === 'http://markatverse.com' ||
                    cleanOrigin.endsWith('.markatverse.com');
                const isVercel = cleanOrigin.endsWith('.vercel.app');
                if (isAllowedOrigin || isMarkatVerse || isVercel) {
                    callback(null, true);
                }
                else {
                    callback(new Error('Cross-Origin Request Blocked by MarkatVerse Security Policy'));
                }
            },
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            credentials: true,
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
        });
        app.use(helmet({
            contentSecurityPolicy: false,
            crossOriginEmbedderPolicy: false,
            crossOriginResourcePolicy: { policy: "cross-origin" },
            frameguard: { action: 'deny' },
            xssFilter: true,
            noSniff: true,
        }));
        const generalLimiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 1000,
            message: { message: 'Too many requests from this IP, please try again later.', statusCode: 429 },
            standardHeaders: true,
            legacyHeaders: false,
        });
        app.use(generalLimiter);
        const authLimiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 20,
            message: {
                message: 'Too many authentication or verification attempts. Please wait 15 minutes before trying again.',
                statusCode: 429
            },
            standardHeaders: true,
            legacyHeaders: false,
        });
        expressApp.use('/auth/login', authLimiter);
        expressApp.use('/auth/send-signup-otp', authLimiter);
        expressApp.use('/auth/verify-signup-otp', authLimiter);
        expressApp.use('/auth/forgot-password', authLimiter);
        expressApp.use('/auth/reset-password', authLimiter);
        expressApp.use('/auth/support-ticket', authLimiter);
        app.use(express.json({ limit: '10mb' }));
        app.use(express.urlencoded({ limit: '10mb', extended: true }));
        app.use(compression({
            level: 6,
            threshold: 1024,
        }));
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