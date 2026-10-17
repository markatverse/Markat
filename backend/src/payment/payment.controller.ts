import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentService } from './payment.service.js';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('razorpay/key')
  async getRazorpayKey() {
    return this.paymentService.getPublicKey();
  }

  @Post('razorpay/create-order')
  @HttpCode(HttpStatus.OK)
  async createRazorpayOrder(
    @Body() body: { amount: number; receipt?: string; notes?: Record<string, any> },
  ) {
    return this.paymentService.createRazorpayOrder(body.amount, body.receipt, body.notes);
  }

  @Post('razorpay/verify')
  @HttpCode(HttpStatus.OK)
  async verifyPayment(
    @Body()
    body: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
  ) {
    return this.paymentService.verifyPayment(body);
  }
}
