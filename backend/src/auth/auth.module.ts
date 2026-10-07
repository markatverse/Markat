import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { PrismaModule } from '../prisma.module.js';
import { JwtModule } from '@nestjs/jwt';
import { SecurityModule } from '../security/security.module.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { getJwtSecret } from './jwt-secret.js';

@Module({
  imports: [
    PrismaModule,
    SecurityModule,
    JwtModule.register({
      global: true,
      secret: getJwtSecret(),
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, NotificationsService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
