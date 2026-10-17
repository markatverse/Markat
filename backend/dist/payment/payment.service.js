var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaymentService_1;
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma.service.js';
let PaymentService = PaymentService_1 = class PaymentService {
    prisma;
    logger = new Logger(PaymentService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRazorpayCredentials() {
        const envKeyId = process.env.RAZORPAY_KEY_ID;
        const envKeySecret = process.env.RAZORPAY_KEY_SECRET;
        if (envKeyId && envKeySecret) {
            return { keyId: envKeyId.trim(), keySecret: envKeySecret.trim() };
        }
        try {
            const configRecord = await this.prisma.systemConfig.findUnique({
                where: { key: 'PAYMENT_METHODS' },
            });
            if (configRecord && configRecord.value) {
                const methods = JSON.parse(configRecord.value);
                if (Array.isArray(methods)) {
                    const razorpayMethod = methods.find((m) => m.name?.toLowerCase().includes('razorpay') &&
                        m.status === 'Active');
                    if (razorpayMethod && razorpayMethod.config) {
                        try {
                            const parsed = JSON.parse(razorpayMethod.config);
                            if (parsed.key_id && parsed.key_secret) {
                                return {
                                    keyId: String(parsed.key_id).trim(),
                                    keySecret: String(parsed.key_secret).trim(),
                                };
                            }
                        }
                        catch {
                        }
                    }
                }
            }
        }
        catch (e) {
            this.logger.warn(`Failed to read PAYMENT_METHODS config: ${e?.message}`);
        }
        return {
            keyId: envKeyId || 'rzp_test_MarkatVerseKey',
            keySecret: envKeySecret || 'MarkatVerseSecret123',
        };
    }
    async getPublicKey() {
        const { keyId } = await this.getRazorpayCredentials();
        const isReal = Boolean(keyId && !keyId.includes('MarkatVerseKey'));
        return {
            keyId,
            isConfigured: isReal,
        };
    }
    async getRazorpayClient() {
        const { keyId, keySecret } = await this.getRazorpayCredentials();
        return new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });
    }
    async createRazorpayOrder(amount, receipt, notes) {
        if (!amount || amount <= 0) {
            throw new BadRequestException('Amount must be greater than 0');
        }
        const { keyId, keySecret } = await this.getRazorpayCredentials();
        const isMock = !keyId || keyId.includes('MarkatVerseKey');
        const amountInPaise = Math.round(amount * 100);
        const receiptId = receipt || `rcpt_${Date.now().toString().slice(-8)}`;
        if (isMock) {
            const mockOrderId = `order_${Math.random().toString(36).substring(2, 16)}`;
            this.logger.log(`Created Mock Razorpay Order: ${mockOrderId} for ₹${amount}`);
            return {
                id: mockOrderId,
                entity: 'order',
                amount: amountInPaise,
                amount_paid: 0,
                amount_due: amountInPaise,
                currency: 'INR',
                receipt: receiptId,
                status: 'created',
                attempts: 0,
                notes: notes || {},
                keyId,
                isMock: true,
            };
        }
        try {
            const razorpay = await this.getRazorpayClient();
            const order = await razorpay.orders.create({
                amount: amountInPaise,
                currency: 'INR',
                receipt: receiptId,
                notes: notes || {},
            });
            this.logger.log(`Created Razorpay Order: ${order.id} for ₹${amount}`);
            return {
                ...order,
                keyId,
                isMock: false,
            };
        }
        catch (error) {
            this.logger.error(`Failed to create Razorpay order: ${error.message}`, error.stack);
            throw new BadRequestException(error?.error?.description || error.message || 'Razorpay order creation failed');
        }
    }
    async verifyPayment(data) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
        if (!razorpay_order_id || !razorpay_payment_id) {
            throw new BadRequestException('Missing order ID or payment ID');
        }
        const { keyId, keySecret } = await this.getRazorpayCredentials();
        if (keyId.includes('MarkatVerseKey') || !razorpay_signature) {
            return {
                verified: true,
                message: 'Payment verified successfully (Mock/Sandbox)',
                paymentId: razorpay_payment_id,
            };
        }
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(body.toString())
            .digest('hex');
        const isMatch = expectedSignature === razorpay_signature;
        if (!isMatch) {
            this.logger.warn(`Signature mismatch for order ${razorpay_order_id}. Expected: ${expectedSignature}, Received: ${razorpay_signature}`);
            throw new BadRequestException('Invalid payment signature verification failed');
        }
        return {
            verified: true,
            message: 'Payment signature verified successfully',
            paymentId: razorpay_payment_id,
        };
    }
};
PaymentService = PaymentService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], PaymentService);
export { PaymentService };
//# sourceMappingURL=payment.service.js.map