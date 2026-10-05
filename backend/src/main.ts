import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

import { join } from 'path';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const expressApp = express();
// Serve the uploads folder statically
expressApp.use('/public/uploads', express.static(join(process.cwd(), 'uploads')));

let cachedServer: any;

async function bootstrap() {
  if (!cachedServer) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );
    // Strict CORS Configuration
    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
    
    // HTTP Headers Security (Helmet)
    app.use(helmet());
    app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Allow images to load on frontend

    // Rate Limiting (DDoS Protection)
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // Limit each IP to 1000 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true, 
      legacyHeaders: false, 
    });
    app.use(limiter);
    
    // Increase JSON body payload size for Base64 image uploads
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

// Export for Vercel Serverless
export default async function handler(req: any, res: any) {
  const server = await bootstrap();
  return server(req, res);
}
