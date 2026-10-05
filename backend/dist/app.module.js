var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './users/users.module.js';
import { ProductsModule } from './products/products.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { SellersModule } from './sellers/sellers.module.js';
import { PrismaModule } from './prisma.module.js';
import { LeadsModule } from './leads/leads.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UploadModule } from './upload/upload.module.js';
import { ServiceQueueModule } from './service-queue/service-queue.module.js';
import { ConfigurationModule } from './configuration/configuration.module.js';
import { ListingsModule } from './listings/listings.module.js';
import { WalletModule } from './wallet/wallet.module.js';
import { WebhookModule } from './webhook/webhook.module.js';
import { SellerConfigModule } from './seller-config/seller-config.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { AdminModule } from './admin/admin.module.js';
import { WorkflowsModule } from './workflows/workflows.module.js';
import { IdGeneratorModule } from './id-generator/id-generator.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { SystemConfigModule } from './system-config/system-config.module.js';
import { ContentModule } from './content/content.module.js';
import { CommercialModule } from './commercial/commercial.module.js';
import { SupportModule } from './support/support.module.js';
import { SecurityModule } from './security/security.module.js';
import { RecommendationsModule } from './recommendations/recommendations.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { EventsModule } from './events/events.module.js';
import { AnalyticsModule } from './analytics/analytics.module.js';
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
        imports: [
            CacheModule.register({
                isGlobal: true,
                ttl: 60000,
                max: 100,
            }),
            EventsModule, PrismaModule, UsersModule, ProductsModule, OrdersModule, SellersModule, LeadsModule, AuthModule, UploadModule, ServiceQueueModule, ConfigurationModule, ListingsModule, WalletModule, WebhookModule, SellerConfigModule, CategoriesModule, AdminModule, WorkflowsModule, IdGeneratorModule, ReviewsModule, SystemConfigModule, ContentModule, CommercialModule, SupportModule, SecurityModule, RecommendationsModule, NotificationsModule, AnalyticsModule
        ],
        controllers: [AppController],
        providers: [
            AppService,
        ],
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map