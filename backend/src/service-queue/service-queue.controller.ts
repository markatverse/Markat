import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ServiceQueueService } from './service-queue.service.js';

@Controller('service-queue')
export class ServiceQueueController {
  constructor(private readonly serviceQueueService: ServiceQueueService) {}

  // ─── Queue Routes ─────────────────────────────────────────────────────────────

  /** Create a new service queue */
  @Post('queue')
  createQueue(
    @Body()
    body: {
      shopName: string;
      avgMinutes?: number;
      pricePerHour?: number;
      sellerId?: string;
    },
  ) {
    return this.serviceQueueService.createQueue(body);
  }

  /** Get queue for a specific seller */
  @Get('seller/:sellerId')
  getQueueBySeller(@Param('sellerId') sellerId: string) {
    return this.serviceQueueService.getQueueBySeller(sellerId);
  }

  /** List all open queues */
  @Get('queues')
  getAllQueues() {
    return this.serviceQueueService.getAllQueues();
  }

  /** Get live queue status */
  @Get(':queueId/status')
  getQueueStatus(@Param('queueId') queueId: string) {
    return this.serviceQueueService.getQueueStatus(queueId);
  }

  /** Customer joins queue */
  @Post(':queueId/join')
  joinQueue(
    @Param('queueId') queueId: string,
    @Body() body: { customerName: string; phone?: string; service?: string; staffId?: string; staffName?: string; resourceId?: string; appointmentTime?: string; price?: number },
  ) {
    return this.serviceQueueService.joinQueue(queueId, body);
  }

  /** ServiceQueue calls next customer */
  @Post(':queueId/next')
  callNext(
    @Param('queueId') queueId: string,
    @Body() body: { staffId?: string; resourceId?: string }
  ) {
    return this.serviceQueueService.callNext(queueId, body?.resourceId, body?.staffId);
  }

  /** Today's stats for this queue */
  @Get(':queueId/stats')
  getTodayStats(@Param('queueId') queueId: string) {
    return this.serviceQueueService.getTodayStats(queueId);
  }

  /** Analytics for this queue */
  @Get(':queueId/analytics')
  getAnalytics(@Param('queueId') queueId: string) {
    return this.serviceQueueService.getAnalytics(queueId);
  }

  /** Update queue settings (avgMinutes, pricePerHour, isOpen) */
  @Patch(':queueId/settings')
  updateSettings(
    @Param('queueId') queueId: string,
    @Body()
    body: {
      avgMinutes?: number;
      pricePerHour?: number;
      isOpen?: boolean;
      shopName?: string;
    },
  ) {
    return this.serviceQueueService.updateQueueSettings(queueId, body);
  }

  /** Reset queue (new day) */
  @Delete(':queueId/reset')
  resetQueue(@Param('queueId') queueId: string) {
    return this.serviceQueueService.resetQueue(queueId);
  }

  /** Admin override status */
  @Patch(':queueId/admin-status')
  updateAdminStatus(
    @Param('queueId') queueId: string,
    @Body('status') status: string
  ) {
    return this.serviceQueueService.updateAdminStatus(queueId, status);
  }

  // ─── Token Routes ─────────────────────────────────────────────────────────────

  /** Get a single customer's token status */
  @Get('token/:tokenId')
  getTokenStatus(@Param('tokenId') tokenId: string) {
    return this.serviceQueueService.getTokenStatus(tokenId);
  }

  /** Mark token as NO_SHOW */
  @Patch('token/:tokenId/no-show')
  markNoShow(@Param('tokenId') tokenId: string) {
    return this.serviceQueueService.markNoShow(tokenId);
  }

  /** Mark token as DONE */
  @Patch('token/:tokenId/done')
  markDone(@Param('tokenId') tokenId: string) {
    return this.serviceQueueService.markDone(tokenId);
  }

  /** Check in an appointment */
  @Post('token/:tokenId/check-in')
  checkIn(@Param('tokenId') tokenId: string) {
    return this.serviceQueueService.checkIn(tokenId);
  }

  /** Mark token as ABSENT */
  @Patch('token/:tokenId/absent')
  markAbsent(@Param('tokenId') tokenId: string) {
    return this.serviceQueueService.markAbsent(tokenId);
  }

  /** Mark token as WAITING (Return to queue) */
  @Patch('token/:tokenId/waiting')
  markWaiting(@Param('tokenId') tokenId: string) {
    return this.serviceQueueService.markWaiting(tokenId);
  }

  /** Start serving a token (e.g. Start Wash / Call into Bay) */
  @Patch('token/:tokenId/start')
  startServing(
    @Param('tokenId') tokenId: string,
    @Body('resourceId') resourceId?: string,
  ) {
    return this.serviceQueueService.startServing(tokenId, resourceId);
  }

  // ─── Staff & Resources ───────────────────────────────────────────────────

  @Post(':queueId/staff')
  addStaff(@Param('queueId') queueId: string, @Body() body: any) {
    return this.serviceQueueService.addStaff(queueId, body);
  }

  @Post(':queueId/resource')
  addResource(@Param('queueId') queueId: string, @Body() body: any) {
    return this.serviceQueueService.addResource(queueId, body);
  }

  @Delete(':queueId/staff/:staffId')
  deleteStaff(@Param('queueId') queueId: string, @Param('staffId') staffId: string) {
    return this.serviceQueueService.deleteStaff(queueId, staffId);
  }

  @Delete(':queueId/resource/:resourceId')
  deleteResource(@Param('queueId') queueId: string, @Param('resourceId') resourceId: string) {
    return this.serviceQueueService.deleteResource(queueId, resourceId);
  }
}
