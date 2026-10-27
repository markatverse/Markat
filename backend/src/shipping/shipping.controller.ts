import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ShippingService } from './shipping.service.js';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

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
