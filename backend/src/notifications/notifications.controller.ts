import { Controller, Get, Post, Put, Delete, Body, Param, Headers, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service.js';

@Controller('admin/notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly jwtService: JwtService,
  ) { }

  @Get('public-key')
  getPublicKey() {
    return this.notificationsService.getPublicKey();
  }

  @Post('subscribe')
  subscribe(
    @Body() body: { userId: string; subscription: any },
    @Headers('authorization') authorization?: string,
  ) {
    if (!body.subscription || !body.userId) {
      return { success: false, message: 'Invalid subscription payload' };
    }
    return this.notificationsService.saveSubscription(body.userId, body.subscription);
  }

  @Get('logs')
  async getAllLogs() {
    return this.notificationsService.getAllLogs();
  }

  @Get('history/:userId')
  async getHistory(
    @Param('userId') userId: string,
    @Headers('authorization') authorization?: string,
  ) {
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : undefined;
    if (!token) throw new UnauthorizedException('Authentication required');

    let authenticatedUserId: string;
    try {
      const decoded: any = this.jwtService.verify(token);
      authenticatedUserId = decoded.sub || decoded.id;
    } catch {
      throw new UnauthorizedException('Invalid or expired session');
    }

    const targetId = (userId === 'me' || !userId) ? authenticatedUserId : userId;
    if (authenticatedUserId !== targetId) {
      throw new ForbiddenException('Access denied');
    }

    return this.notificationsService.findHistoryForUser(targetId);
  }

  @Get('sms')
  async getSmsTemplates() {
    return this.notificationsService.getSmsTemplates();
  }

  @Post('sms')
  async createSmsTemplate(@Body() data: { title: string; message: string; status?: string }) {
    return this.notificationsService.createSmsTemplate(data);
  }

  @Put('sms/:id')
  async updateSmsTemplate(@Param('id') id: string, @Body() data: any) {
    return this.notificationsService.updateSmsTemplate(id, data);
  }

  @Delete('sms/:id')
  async deleteSmsTemplate(@Param('id') id: string) {
    return this.notificationsService.deleteSmsTemplate(id);
  }

  // --- PUSH ---
  @Get('push')
  async getPushTemplates() {
    return this.notificationsService.getPushTemplates();
  }

  @Post('push')
  async createPushTemplate(@Body() data: { title: string; message: string; status?: string }) {
    return this.notificationsService.createPushTemplate(data);
  }

  @Put('push/:id')
  async updatePushTemplate(@Param('id') id: string, @Body() data: any) {
    return this.notificationsService.updatePushTemplate(id, data);
  }

  @Delete('push/:id')
  async deletePushTemplate(@Param('id') id: string) {
    return this.notificationsService.deletePushTemplate(id);
  }
  // --- EMAIL ---
  @Get('email')
  async getEmailTemplates() {
    return this.notificationsService.getEmailTemplates();
  }

  @Post('email')
  async createEmailTemplate(@Body() data: { title: string; message: string; status?: string }) {
    return this.notificationsService.createEmailTemplate(data);
  }

  @Put('email/:id')
  async updateEmailTemplate(@Param('id') id: string, @Body() data: any) {
    return this.notificationsService.updateEmailTemplate(id, data);
  }

  @Delete('email/:id')
  async deleteEmailTemplate(@Param('id') id: string) {
    return this.notificationsService.deleteEmailTemplate(id);
  }
}
