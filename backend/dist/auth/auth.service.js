var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service.js';
import { IdGeneratorService } from '../id-generator/id-generator.service.js';
import { SecurityService } from '../security/security.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import * as bcrypt from 'bcryptjs';
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    idGenerator;
    securityService;
    notificationsService;
    logger = new Logger(AuthService_1.name);
    otpStore = new Map();
    constructor(prisma, jwtService, idGenerator, securityService, notificationsService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.idGenerator = idGenerator;
        this.securityService = securityService;
        this.notificationsService = notificationsService;
    }
    async signup(data, authHeader) {
        if (!data.email || !data.phone) {
            throw new BadRequestException('Email and Phone are required');
        }
        if (!data.password || typeof data.password !== 'string' || data.password.length < 8) {
            throw new BadRequestException('Password must be at least 8 characters long for security.');
        }
        const requestedRole = data.role?.toUpperCase() || 'CONSUMER';
        if (requestedRole.includes('ADMIN') || requestedRole === 'SUPER_ADMIN') {
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new UnauthorizedException('Admin privileges required to create staff accounts.');
            }
            try {
                const token = authHeader.replace('Bearer ', '');
                const decoded = this.jwtService.verify(token);
                if (decoded.role !== 'SUPER_ADMIN' && decoded.role !== 'ADMIN') {
                    throw new UnauthorizedException('Insufficient privileges to create staff accounts.');
                }
            }
            catch (err) {
                throw new UnauthorizedException('Invalid or expired admin token.');
            }
        }
        const existing = await this.prisma.user.findFirst({
            where: {
                OR: [
                    data.email ? { email: data.email } : undefined,
                    data.phone ? { phone: data.phone } : undefined,
                ].filter(Boolean),
            },
        });
        if (existing) {
            if (data.role === 'SELLER' && existing.role !== 'SELLER') {
                const isMatch = await bcrypt.compare(data.password, existing.password);
                if (!isMatch) {
                    throw new BadRequestException('Account already exists with this email/phone. Incorrect password.');
                }
                const updated = await this.prisma.user.update({
                    where: { id: existing.id },
                    data: { role: 'SELLER' }
                });
                return this.generateToken(updated);
            }
            if (existing.role === 'SELLER') {
                throw new BadRequestException('Account is already registered as a Seller. Please login.');
            }
            throw new BadRequestException('User with this email or phone already exists');
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
        let markatId = await this.idGenerator.generateUserId();
        if (data.role && data.role.toLowerCase().includes('admin')) {
            markatId = await this.idGenerator.generateAdminId();
        }
        const user = await this.prisma.user.create({
            data: {
                markatId,
                name: data.name,
                email: data.email || `missing-email-${markatId}@markat.local`,
                phone: data.phone,
                password: hashedPassword,
                role: data.role || 'CONSUMER',
            },
        });
        await this.securityService.createAuditLog({
            action: 'SIGNUP',
            resource: 'User',
            details: `User ${user.name} registered as ${user.role}`,
            userId: user.id,
        });
        return this.generateToken(user);
    }
    async sendSignupOtp(identifier, type, phone) {
        if (type !== 'email') {
            throw new BadRequestException('Only email OTP is supported currently');
        }
        const existing = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    ...(phone ? [{ phone }] : [])
                ]
            }
        });
        if (existing) {
            throw new BadRequestException('An account with this email or phone number already exists.');
        }
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const expires = new Date(Date.now() + 5 * 60 * 1000);
        this.otpStore.set(identifier, { code, expires });
        try {
            const nodemailer = await import('nodemailer');
            if (process.env.SMTP_HOST && process.env.SMTP_USER) {
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: parseInt(process.env.SMTP_PORT || '587'),
                    secure: process.env.SMTP_SECURE === 'true',
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                    },
                });
                await transporter.sendMail({
                    from: process.env.SMTP_FROM || `"MarkatVerse Support" <${process.env.SMTP_USER}>`,
                    replyTo: `"MarkatVerse No-Reply" <noreply@markatverse.com>`,
                    to: identifier,
                    subject: 'Your MarkatVerse Verification Code',
                    headers: {
                        'List-Unsubscribe': '<mailto:unsubscribe@markatverse.com?subject=unsubscribe>',
                    },
                    text: `Hello,\n\nYou recently requested a verification code for your MarkatVerse account. Please see your code below:\n\n${code}\n\nThis code will remain active for the next 5 minutes. If you did not request this, please let us know immediately.\n\nBest regards,\nMarkatVerse Support Team`,
                    html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px 20px; color: #1f2937; line-height: 1.6;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1e3a8a; font-size: 28px; font-weight: 800; letter-spacing: 2px; margin: 0;">MARKATVERSE</h1>
              </div>
              <h2 style="color: #111827; font-size: 22px; font-weight: 600; margin-bottom: 20px;">Verification Code</h2>
              <p style="font-size: 16px; margin-bottom: 25px;">Hello,</p>
              <p style="font-size: 16px; margin-bottom: 25px;">You recently requested a verification code for your MarkatVerse account. Please use the highly secure code below:</p>
              
              <div style="background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                <span style="font-family: monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #2563eb;">${code}</span>
              </div>
              
              <p style="font-size: 14px; color: #dc2626; margin-bottom: 30px;">For your security, this code will expire in exactly 5 minutes.</p>
              <p style="font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px;">If you did not request this code, you can safely ignore this email.</p>
              <p style="font-size: 14px; color: #6b7280;">Best regards,<br><strong>MarkatVerse Support Team</strong></p>
            </div>
          `
                });
                this.logger.log(`Signup OTP email sent to ${identifier}`);
            }
            else {
                this.logger.warn(`No SMTP configuration found. Development mode signup OTP for ${identifier}: ${code}`);
            }
        }
        catch (error) {
            this.logger.error('Failed to send signup OTP email', error);
        }
        return { message: `OTP sent successfully to ${identifier}`, success: true };
    }
    async verifySignupOtp(identifier, code, type) {
        const record = this.otpStore.get(identifier);
        if (!record) {
            throw new BadRequestException('No OTP request found for this email or it has expired');
        }
        if (record.code !== code.toUpperCase()) {
            throw new BadRequestException('Invalid OTP code');
        }
        if (new Date() > record.expires) {
            this.otpStore.delete(identifier);
            throw new BadRequestException('OTP code has expired (valid for 5 minutes)');
        }
        this.otpStore.delete(identifier);
        return { message: 'Code verified successfully', success: true };
    }
    async login(data) {
        const identifier = data.email || data.phone;
        if (!identifier) {
            throw new BadRequestException('Email or Phone is required');
        }
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { phone: identifier },
                    { markatId: identifier }
                ]
            },
            include: { business: true }
        });
        if (!user || !user.password) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const isMatch = await bcrypt.compare(data.password, user.password);
        if (!isMatch) {
            await this.securityService.createAuditLog({
                action: 'LOGIN_FAILED',
                resource: 'User',
                details: `Failed login attempt for ${identifier}`,
            });
            throw new UnauthorizedException('Invalid credentials');
        }
        this.securityService.createAuditLog({
            action: 'LOGIN',
            resource: 'User',
            details: `User logged in`,
            userId: user.id,
        }).catch(err => this.logger.error('Failed audit log', err));
        return this.generateToken(user);
    }
    async phoneLogin(phone) {
        if (!phone) {
            throw new BadRequestException('Phone is required');
        }
        let user = await this.prisma.user.findUnique({ where: { phone } });
        if (!user) {
            const markatId = await this.idGenerator.generateUserId();
            user = await this.prisma.user.create({
                data: {
                    markatId,
                    name: 'New User',
                    phone: phone,
                    email: `${phone}@temporary.markatverse.com`,
                    password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
                    role: 'CONSUMER',
                },
            });
        }
        return this.generateToken(user);
    }
    async googleLogin(token, role = 'CONSUMER') {
        if (!token) {
            throw new BadRequestException('Google token is required');
        }
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new BadRequestException('Invalid Google token');
            }
            const payload = await response.json();
            if (!payload || !payload.email) {
                throw new BadRequestException('Invalid Google token payload');
            }
            const email = payload.email;
            const name = payload.name || 'Google User';
            let user = await this.prisma.user.findFirst({ where: { email } });
            if (!user) {
                const markatId = await this.idGenerator.generateUserId();
                user = await this.prisma.user.create({
                    data: {
                        markatId,
                        name: name,
                        email: email,
                        phone: `google-phone-${markatId}`,
                        password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
                        role: role.toUpperCase(),
                    },
                });
            }
            return this.generateToken(user);
        }
        catch (err) {
            console.error(err);
            throw new UnauthorizedException('Google authentication failed');
        }
    }
    async getMe(token) {
        try {
            const payload = this.jwtService.verify(token);
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                select: { id: true, markatId: true, name: true, email: true, phone: true, role: true, business: { include: { wallet: true } } }
            });
            if (!user)
                throw new UnauthorizedException('User not found');
            return user;
        }
        catch {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
    async forgotPassword(identifier) {
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [{ email: identifier }, { phone: identifier }]
            }
        });
        if (!user) {
            throw new BadRequestException('No account found with this email or phone');
        }
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let resetCode = '';
        for (let i = 0; i < 6; i++) {
            resetCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const resetCodeExpires = new Date(Date.now() + 5 * 60 * 1000);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { resetCode, resetCodeExpires }
        });
        try {
            const nodemailer = await import('nodemailer');
            if (process.env.SMTP_HOST && process.env.SMTP_USER) {
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: parseInt(process.env.SMTP_PORT || '587'),
                    secure: process.env.SMTP_SECURE === 'true',
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                    },
                });
                await transporter.sendMail({
                    from: process.env.SMTP_FROM || `"MarkatVerse Support" <${process.env.SMTP_USER}>`,
                    replyTo: `"MarkatVerse No-Reply" <noreply@markatverse.com>`,
                    to: user.email || undefined,
                    subject: 'MarkatVerse Password Reset Code',
                    headers: {
                        'List-Unsubscribe': '<mailto:unsubscribe@markatverse.com?subject=unsubscribe>',
                    },
                    text: `Hello ${user.name},\n\nWe received a request to reset your password. Please find your secure authorization code below:\n\n${resetCode}\n\nFor your security, this code will expire in 5 minutes. If you did not request this change, please contact us or ignore this message.\n\nBest regards,\nMarkatVerse Support Team`,
                    html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px 20px; color: #1f2937; line-height: 1.6;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1e3a8a; font-size: 28px; font-weight: 800; letter-spacing: 2px; margin: 0;">MARKATVERSE</h1>
              </div>
              <h2 style="color: #111827; font-size: 22px; font-weight: 600; margin-bottom: 20px;">Password Reset Request</h2>
              <p style="font-size: 16px; margin-bottom: 25px;">Hello ${user.name},</p>
              <p style="font-size: 16px; margin-bottom: 25px;">We received a request to reset the password for your MarkatVerse account. Please use the highly secure authorization code below:</p>
              
              <div style="background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                <span style="font-family: monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #2563eb;">${resetCode}</span>
              </div>
              
              <p style="font-size: 14px; color: #dc2626; margin-bottom: 30px;">For your security, this code will expire in exactly 5 minutes.</p>
              <p style="font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px;">If you did not request a password reset, please ignore this email or contact support.</p>
              <p style="font-size: 14px; color: #6b7280;">Best regards,<br><strong>MarkatVerse Support Team</strong></p>
            </div>
          `
                });
                this.logger.log(`Password reset email sent to ${user.email}`);
            }
            else {
                this.logger.warn(`No SMTP configuration found. Development mode reset code for ${identifier}: ${resetCode}`);
            }
        }
        catch (error) {
            this.logger.error('Failed to send reset email', error);
        }
        return {
            message: 'Password reset code sent to your email',
            user_name: user.name,
        };
    }
    async resetPassword(resetToken, newPassword) {
        throw new BadRequestException('Method signature changed, use resetPasswordWithCode instead');
    }
    async verifyResetCode(identifier, code) {
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [{ email: identifier }, { phone: identifier }]
            }
        });
        if (!user) {
            throw new BadRequestException('No account found with this email or phone');
        }
        if (!user.resetCode || user.resetCode !== code.toUpperCase()) {
            throw new BadRequestException('Invalid or incorrect reset code');
        }
        if (!user.resetCodeExpires || new Date() > new Date(user.resetCodeExpires)) {
            throw new BadRequestException('Reset code has expired (valid for 5 minutes)');
        }
        return { message: 'Code verified successfully' };
    }
    async resetPasswordWithCode(identifier, code, newPassword) {
        if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
            throw new BadRequestException('New password must be at least 8 characters long for security.');
        }
        await this.verifyResetCode(identifier, code);
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [{ email: identifier }, { phone: identifier }]
            }
        });
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetCode: null,
                resetCodeExpires: null
            },
        });
        return { message: 'Password updated successfully' };
    }
    async sendSupportTicket(ticket) {
        if (!ticket.email || !ticket.message) {
            throw new BadRequestException('Email and message are required.');
        }
        try {
            const nodemailer = await import('nodemailer');
            if (process.env.SMTP_HOST && process.env.SMTP_USER) {
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: parseInt(process.env.SMTP_PORT || '587'),
                    secure: process.env.SMTP_SECURE === 'true',
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                    },
                });
                const subject = ticket.subject || 'New Customer Support Request';
                const senderName = ticket.name || 'Customer';
                await transporter.sendMail({
                    from: process.env.SMTP_FROM || `"MarkatVerse Support" <${process.env.SMTP_USER}>`,
                    to: process.env.SMTP_USER,
                    replyTo: `"${senderName}" <${ticket.email}>`,
                    subject: `[Support Ticket] ${subject} - from ${senderName}`,
                    html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
              <h2 style="color: #1e3a8a; margin-top: 0;">New Support Ticket Received</h2>
              <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 120px;">Customer:</td><td style="color: #0f172a;">${senderName}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Email:</td><td style="color: #0f172a;"><a href="mailto:${ticket.email}">${ticket.email}</a></td></tr>
                ${ticket.phone ? `<tr><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Phone:</td><td style="color: #0f172a;">${ticket.phone}</td></tr>` : ''}
                <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Subject:</td><td style="color: #0f172a;">${subject}</td></tr>
              </table>
              <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; border-radius: 6px; margin: 16px 0;">
                <p style="margin: 0; white-space: pre-wrap; color: #334155; line-height: 1.6;">${ticket.message}</p>
              </div>
              <p style="font-size: 13px; color: #94a3b8; margin-top: 24px;">Click Reply in your email client to respond directly to ${ticket.email}.</p>
            </div>
          `,
                });
                await transporter.sendMail({
                    from: process.env.SMTP_FROM || `"MarkatVerse Support" <${process.env.SMTP_USER}>`,
                    to: ticket.email,
                    subject: 'We received your message - MarkatVerse Support',
                    html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; color: #1e293b;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #1e3a8a; font-size: 26px; font-weight: 800; letter-spacing: 1px; margin: 0;">MARKATVERSE</h1>
                <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Customer Care</p>
              </div>
              <h2 style="font-size: 20px; color: #0f172a; margin-bottom: 12px;">Thank you for contacting us, ${senderName}!</h2>
              <p style="font-size: 15px; line-height: 1.6; color: #334155;">
                We have received your message regarding <strong>"${subject}"</strong>. Our support team is reviewing it and will respond to this email address within 24 hours.
              </p>
              <div style="background: #f1f5f9; border-radius: 8px; padding: 14px 18px; margin: 20px 0;">
                <p style="font-size: 13px; color: #64748b; margin: 0 0 6px 0; font-weight: 600;">Your Message Summary:</p>
                <p style="font-size: 14px; color: #1e293b; margin: 0; white-space: pre-wrap;">${ticket.message}</p>
              </div>
              <p style="font-size: 14px; color: #64748b;">Best regards,<br><strong>MarkatVerse Support Team</strong></p>
            </div>
          `,
                }).catch(err => this.logger.warn('Failed to send confirmation to user', err));
                this.logger.log(`Support ticket sent from ${ticket.email}`);
            }
        }
        catch (err) {
            this.logger.error('Failed to dispatch support ticket email', err);
            throw new BadRequestException('Failed to deliver support email. Please try again later.');
        }
        return { success: true, message: 'Your message has been sent to our support team. We will reply within 24 hours!' };
    }
    async generateToken(user) {
        if (user.role) {
            this.notificationsService.sendNotification({
                type: 'CUSTOMER_LOGIN',
                recipientId: user.id,
                data: {}
            }).catch(err => this.logger.error('Failed to send login push', err));
        }
        const payload = { sub: user.id, email: user.email, role: user.role, name: user.name };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                markatId: user.markatId,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                business: user.business
            }
        };
    }
};
AuthService = AuthService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        JwtService,
        IdGeneratorService,
        SecurityService,
        NotificationsService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map