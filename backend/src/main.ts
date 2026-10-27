import 'dotenv/config';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';

// Robust multi-path env loading
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });
dotenv.config({ path: resolve(process.cwd(), '.env') });
dotenv.config({ path: resolve(process.cwd(), 'backend/.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const expressApp = express();

// ── Anti-Bot & Vulnerability Scanner Defense Shield ─────────────────────
const BAD_BOT_PATTERNS = [
  /sqlmap/i,
  /nikto/i,
  /acunetix/i,
  /havij/i,
  /nmap/i,
  /masscan/i,
  /python-requests/i, // block non-browser raw automation in production
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
  /\.\.\//, // Directory traversal
  /<script.*?>/i, // Cross-site scripting in URI
];

expressApp.use((req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  const url = req.url || '';

  // 1. Block Malicious Vulnerability Scanning URLs
  for (const pattern of MALICIOUS_PATH_PATTERNS) {
    if (pattern.test(url)) {
      return res.status(403).json({
        statusCode: 403,
        message: 'Forbidden: Request path matched security inspection policy',
      });
    }
  }

  // Allow localhost / local tests to skip bot user-agent checks in development
  const isLocal = req.headers.host?.includes('localhost') || req.headers.host?.includes('127.0.0.1');

  // 2. Block Known Malicious Bot Scanners
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

// Serve the uploads folder statically
expressApp.use('/public/uploads', express.static(join(process.cwd(), 'uploads')));

let cachedServer: any;

async function bootstrap() {
  if (!cachedServer) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );
    // Strict Origin Whitelist for CORS
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) 
      : ['http://localhost:3000', 'http://127.0.0.1:3000'];

    app.enableCors({
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow mobile apps, postman, and curl requests with no origin header
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
        } else {
          callback(new Error('Cross-Origin Request Blocked by MarkatVerse Security Policy'));
        }
      },
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    });
    
    // HTTP Headers Security (Helmet with production CSP & clickjacking prevention)
    app.use(helmet({
      contentSecurityPolicy: false, // Let reverse-proxy / Next.js handle CSP, or set non-breaking defaults
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow public uploads and assets
      frameguard: { action: 'deny' }, // Prevent Clickjacking attacks
      xssFilter: true, // XSS filter protection
      noSniff: true, // Prevent MIME sniffing
    }));

    // General Rate Limiting (DDoS Protection)
    const generalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // Limit each IP to 1000 requests per windowMs
      message: { message: 'Too many requests from this IP, please try again later.', statusCode: 429 },
      standardHeaders: true, 
      legacyHeaders: false, 
    });
    app.use(generalLimiter);


    // Stricter Rate Limiter for Authentication & OTP & Reset Endpoints (Brute-Force & Spam Prevention)
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes window
      max: 20, // Max 20 attempts per 15 mins for login / OTP / password requests
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
    
    // Controlled JSON payload limit
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ limit: '10mb', extended: true }));
    app.use(compression({
      level: 6, // optimal balance between compression ratio and CPU usage
      threshold: 1024, // only compress responses above 1KB to avoid overhead
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

// Export for Vercel Serverless
export default async function handler(req: any, res: any) {
  const server = await bootstrap();
  return server(req, res);
}
