import { Controller, Post, Get, Body, Param, Query, Patch, Headers, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ShippingService } from './shipping.service.js';

@Controller('shipping')
export class ShippingController {
  constructor(
    private readonly shippingService: ShippingService,
    private readonly jwtService: JwtService,
  ) {}

  private verifyAdminOrStaff(authHeader?: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // In development / local demo preview without auth, allow graceful fallback
      if (process.env.NODE_ENV !== 'production') return;
      throw new UnauthorizedException('Authentication token required');
    }
    try {
      const token = authHeader.replace('Bearer ', '');
      const decoded = this.jwtService.verify(token);
      if (decoded.role !== 'ADMIN' && decoded.role !== 'SUPER_ADMIN' && decoded.role !== 'DISPATCHER') {
        throw new ForbiddenException('Admin / Dispatcher privileges required');
      }
      return decoded;
    } catch {
      if (process.env.NODE_ENV !== 'production') return;
      throw new UnauthorizedException('Invalid or expired session');
    }
  }

  // --- Admin Delivery Platform Endpoints ---

  @Get('delivery/overview')
  async getDeliveryOverview(@Headers('authorization') authHeader?: string) {
    this.verifyAdminOrStaff(authHeader);
    return this.shippingService.getDeliveryOverview();
  }

  @Post('delivery/dispatch/assign')
  async assignDispatch(
    @Body() body: { dispatchId: string; riderId: string },
    @Headers('authorization') authHeader?: string
  ) {
    this.verifyAdminOrStaff(authHeader);
    return this.shippingService.assignDispatch(body.dispatchId, body.riderId);
  }

  @Patch('delivery/fleet/:id/kyc')
  async updateRiderKyc(
    @Param('id') id: string,
    @Body() body: { status: 'APPROVED' | 'REJECTED' | 'SUSPENDED'; reason?: string },
    @Headers('authorization') authHeader?: string
  ) {
    this.verifyAdminOrStaff(authHeader);
    return this.shippingService.updateRiderKyc(id, body.status, body.reason);
  }

  @Get('delivery/zones')
  async getDeliveryZones() {
    return this.shippingService.getDeliveryZones();
  }

  @Post('delivery/zones')
  async updateDeliveryZones(
    @Body() body: any,
    @Headers('authorization') authHeader?: string
  ) {
    this.verifyAdminOrStaff(authHeader);
    return this.shippingService.updateDeliveryZones(body);
  }

  @Post('delivery/payouts/settle')
  async settleRiderPayouts(
    @Body() body: { riderIds?: string[]; note?: string },
    @Headers('authorization') authHeader?: string
  ) {
    this.verifyAdminOrStaff(authHeader);
    return this.shippingService.settleRiderPayouts(body);
  }

  /**
   * Check delivery serviceability and rates for B2C orders
   */
  @Post('serviceability')
  async checkServiceability(
    @Body() body: { pickupPincode: string; deliveryPincode: string; weightKg?: number; isB2B?: boolean },
  ) {
    return this.shippingService.checkServiceability(
      body.pickupPincode,
      body.deliveryPincode,
      body.weightKg || 0.5,
      body.isB2B || false,
    );
  }

  /**
   * Generate B2C Shipment, AWB Code, and Shipping Label
   * Rejects B2B wholesale deals
   */
  @Post('orders/:orderId/ship')
  async createShipment(@Param('orderId') orderId: string, @Body() body: { sellerId?: string }) {
    return this.shippingService.createB2CShipment(orderId, body.sellerId);
  }

  /**
   * Schedule courier pickup at seller store
   */
  @Post('orders/:orderId/pickup')
  async requestPickup(@Param('orderId') orderId: string) {
    return this.shippingService.requestCourierPickup(orderId);
  }

  /**
   * Get live tracking checkpoints
   */
  @Get('track/:trackingNumber')
  async trackShipment(@Param('trackingNumber') trackingNumber: string) {
    return this.shippingService.getTrackingDetails(trackingNumber);
  }

  /**
   * Webhook endpoint for Courier Partners (Shiprocket / Delhivery)
   */
  @Post('webhook')
  async handleWebhook(@Body() payload: any) {
    return this.shippingService.handleWebhook(payload);
  }
}
