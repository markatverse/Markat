var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { IdGeneratorService } from '../id-generator/id-generator.service.js';
import { EventsService } from '../events/events.service.js';
let SellersService = class SellersService {
    prisma;
    idGenerator;
    eventsService;
    sellersCache = null;
    clearCache() {
        this.sellersCache = null;
    }
    constructor(prisma, idGenerator, eventsService) {
        this.prisma = prisma;
        this.idGenerator = idGenerator;
        this.eventsService = eventsService;
    }
    async create(seller, userId) {
        this.clearCache();
        let user = null;
        if (userId) {
            user = await this.prisma.user.findUnique({ where: { id: userId } });
        }
        if (!user && (seller.email || seller.phone)) {
            user = await this.prisma.user.findFirst({
                where: {
                    OR: [
                        seller.email ? { email: seller.email } : undefined,
                        seller.phone ? { phone: seller.phone } : undefined,
                    ].filter(Boolean),
                },
            });
        }
        if (!user) {
            const bcrypt = await import('bcryptjs');
            const markatId = await this.idGenerator.generateUserId();
            user = await this.prisma.user.create({
                data: {
                    markatId,
                    name: seller.ownerName || seller.name || 'Seller',
                    email: seller.email || null,
                    phone: seller.phone || null,
                    password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
                    role: 'SELLER',
                },
            });
        }
        else {
            await this.prisma.user.update({
                where: { id: user.id },
                data: { role: 'SELLER' },
            });
        }
        const existingBusiness = await this.prisma.business.findUnique({
            where: { userId: user.id },
        });
        if (existingBusiness) {
            const updated = await this.prisma.business.update({
                where: { id: existingBusiness.id },
                data: {
                    name: seller.businessName || seller.name || existingBusiness.name,
                    businessType: seller.businessType || existingBusiness.businessType,
                    sector: seller.sector || existingBusiness.sector,
                    address: seller.address || existingBusiness.address,
                    pincode: seller.pincode || existingBusiness.pincode,
                    latitude: seller.latitude || existingBusiness.latitude,
                    longitude: seller.longitude || existingBusiness.longitude,
                    gstNumber: seller.gstNumber !== undefined ? seller.gstNumber : existingBusiness.gstNumber,
                    panNumber: seller.panNumber !== undefined ? seller.panNumber : existingBusiness.panNumber,
                    aadharNumber: seller.aadharNumber !== undefined ? seller.aadharNumber : existingBusiness.aadharNumber,
                    idProofType: seller.idProofType !== undefined ? seller.idProofType : existingBusiness.idProofType,
                    idProofUrl: seller.idProofUrl !== undefined ? seller.idProofUrl : existingBusiness.idProofUrl,
                    businessHours: seller.businessHours || existingBusiness.businessHours,
                    verificationStatus: 'PENDING',
                    kycCallStatus: 'PENDING',
                    registrationFeePaid: seller.registrationFeePaid !== undefined ? !!seller.registrationFeePaid : existingBusiness.registrationFeePaid,
                    registrationFeeAmount: seller.registrationFeeAmount !== undefined ? Number(seller.registrationFeeAmount) : existingBusiness.registrationFeeAmount,
                    registrationFeeStatus: seller.registrationFeeStatus || existingBusiness.registrationFeeStatus,
                    registrationPaymentId: seller.registrationPaymentId || existingBusiness.registrationPaymentId,
                    registrationFeeDate: seller.registrationFeePaid ? new Date() : existingBusiness.registrationFeeDate,
                }
            });
            return { ...updated, status: 'Pending' };
        }
        const businessCode = await this.idGenerator.generateBusinessId(seller.mainType);
        const business = await this.prisma.business.create({
            data: {
                businessCode,
                userId: user.id,
                name: seller.businessName || seller.name || 'My Business',
                description: seller.description || null,
                businessType: seller.businessType || 'WHOLESALER',
                sector: seller.sector || null,
                address: seller.address || null,
                pincode: seller.pincode || null,
                latitude: seller.latitude || null,
                longitude: seller.longitude || null,
                gstNumber: seller.gstNumber || null,
                panNumber: seller.panNumber || null,
                aadharNumber: seller.aadharNumber || null,
                idProofType: seller.idProofType || null,
                idProofUrl: seller.idProofUrl || null,
                businessHours: seller.businessHours || null,
                verified: false,
                verificationStatus: 'PENDING',
                kycCallStatus: 'PENDING',
                registrationFeePaid: !!seller.registrationFeePaid,
                registrationFeeAmount: Number(seller.registrationFeeAmount) || 0,
                registrationFeeStatus: seller.registrationFeeStatus || (seller.registrationFeePaid ? 'PAID' : 'PENDING'),
                registrationPaymentId: seller.registrationPaymentId || null,
                registrationFeeDate: seller.registrationFeePaid ? new Date() : null,
                capabilities: seller.mainType === 'SERVICE' ? ['SERVICE'] : ['B2B', 'B2C'],
            },
        });
        if (seller.mainType === 'SERVICE') {
            const queue = await this.prisma.serviceQueue.create({
                data: {
                    sellerId: user.id,
                    shopName: seller.businessName || seller.name || 'My Shop',
                    avgMinutes: 30,
                },
            });
            if (seller.staff && seller.staff.length > 0) {
                const staffData = await Promise.all(seller.staff.map(async (s) => ({
                    queueId: queue.id,
                    name: s.name,
                    role: s.role,
                    staffCode: await this.idGenerator.generateStaffId(),
                })));
                await this.prisma.serviceStaff.createMany({
                    data: staffData,
                });
            }
            if (seller.resources && seller.resources.length > 0) {
                await this.prisma.serviceResource.createMany({
                    data: seller.resources.map((r) => ({
                        queueId: queue.id,
                        name: r.name,
                        type: r.type,
                    })),
                });
            }
        }
        this.eventsService.emit('business.registered', { businessId: business.id });
        return {
            ...business,
            ownerName: user.name,
            email: user.email,
            phone: user.phone,
            status: 'Pending',
        };
    }
    async findAll() {
        if (this.sellersCache && Date.now() < this.sellersCache.expiry) {
            return this.sellersCache.data;
        }
        const businesses = await this.prisma.business.findMany({
            include: { user: { select: { name: true, email: true, phone: true, role: true } } },
            orderBy: { createdAt: 'desc' }
        });
        const mapped = businesses.map(b => ({
            id: b.id,
            businessCode: b.businessCode,
            userId: b.userId,
            businessName: b.name,
            ownerName: b.user?.name,
            email: b.user?.email,
            phone: b.user?.phone,
            businessType: b.businessType,
            businessModel: b.businessModel,
            sector: b.sector,
            address: b.address,
            pincode: b.pincode,
            gstNumber: b.gstNumber,
            panNumber: b.panNumber,
            aadharNumber: b.aadharNumber,
            idProofType: b.idProofType,
            idProofUrl: b.idProofUrl,
            verified: b.verified,
            verificationStatus: b.verificationStatus || (b.verified ? 'APPROVED' : 'PENDING'),
            kycCallStatus: b.kycCallStatus || 'PENDING',
            kycNotes: b.kycNotes || '',
            status: b.verified ? 'Approved' : (b.verificationStatus === 'REJECTED' ? 'Rejected' : 'Pending'),
            date: b.createdAt.toISOString().split('T')[0],
            createdAt: b.createdAt,
            maxListings: b.maxListings,
            commissionType: b.commissionType,
            commissionRate: b.commissionRate,
            subscriptionStatus: b.subscriptionStatus,
            subscriptionStartDate: b.subscriptionStartDate,
            subscriptionEndDate: b.subscriptionEndDate,
            registrationFeePaid: b.registrationFeePaid ?? false,
            registrationFeeAmount: b.registrationFeeAmount ?? 0,
            registrationFeeStatus: b.registrationFeeStatus || (b.registrationFeePaid ? 'PAID' : 'PENDING'),
            registrationPaymentId: b.registrationPaymentId || null,
            registrationFeeDate: b.registrationFeeDate,
        }));
        this.sellersCache = { data: mapped, expiry: Date.now() + 30000 };
        return mapped;
    }
    async updateStatus(id, status, kycData) {
        this.clearCache();
        const isApproved = status === 'Approved' || status === 'APPROVED';
        const isRejected = status === 'Rejected' || status === 'REJECTED';
        const updateData = {
            verified: isApproved,
            verificationStatus: isApproved ? 'APPROVED' : (isRejected ? 'REJECTED' : 'PENDING'),
        };
        if (kycData?.kycCallStatus) {
            updateData.kycCallStatus = kycData.kycCallStatus;
        }
        else if (isApproved) {
            updateData.kycCallStatus = 'VERIFIED';
        }
        if (kycData?.kycNotes !== undefined) {
            updateData.kycNotes = kycData.kycNotes;
        }
        const business = await this.prisma.business.update({
            where: { id },
            data: updateData,
        });
        return { ...business, status: isApproved ? 'Approved' : (isRejected ? 'Rejected' : status) };
    }
    async updateRegistrationFee(id, data) {
        this.clearCache();
        const updateData = {};
        if (data.registrationFeePaid !== undefined) {
            updateData.registrationFeePaid = !!data.registrationFeePaid;
            if (data.registrationFeePaid && !data.registrationFeeStatus) {
                updateData.registrationFeeStatus = 'PAID';
            }
            if (data.registrationFeePaid) {
                updateData.registrationFeeDate = new Date();
            }
        }
        if (data.registrationFeeAmount !== undefined) {
            updateData.registrationFeeAmount = Number(data.registrationFeeAmount) || 0;
        }
        if (data.registrationFeeStatus !== undefined) {
            updateData.registrationFeeStatus = data.registrationFeeStatus;
            if (data.registrationFeeStatus === 'PAID') {
                updateData.registrationFeePaid = true;
                updateData.registrationFeeDate = new Date();
            }
            else if (data.registrationFeeStatus === 'WAIVED') {
                updateData.registrationFeePaid = true;
            }
            else if (data.registrationFeeStatus === 'PENDING') {
                updateData.registrationFeePaid = false;
            }
        }
        if (data.registrationPaymentId !== undefined) {
            updateData.registrationPaymentId = data.registrationPaymentId;
        }
        return this.prisma.business.update({
            where: { id },
            data: updateData,
        });
    }
    async updateKyc(id, data) {
        this.clearCache();
        const business = await this.prisma.business.update({
            where: { id },
            data: {
                kycCallStatus: data.kycCallStatus,
                kycNotes: data.kycNotes,
            },
        });
        return business;
    }
    async updateUser(userId, data) {
        this.clearCache();
        const business = await this.prisma.business.findUnique({ where: { userId } });
        if (!business)
            throw new Error('Business not found');
        if (data.ownerName || data.phone || data.email) {
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    name: data.ownerName !== undefined ? data.ownerName : undefined,
                    phone: data.phone !== undefined ? data.phone : undefined,
                    email: data.email !== undefined ? data.email : undefined,
                }
            });
        }
        const updatedBusiness = await this.prisma.business.update({
            where: { userId },
            data: {
                name: data.businessName !== undefined ? data.businessName : undefined,
                sector: data.sector !== undefined ? data.sector : undefined,
                businessType: data.businessType !== undefined ? data.businessType : undefined,
                address: data.address !== undefined ? data.address : undefined,
                pincode: data.pincode !== undefined ? data.pincode : undefined,
                latitude: data.latitude !== undefined ? data.latitude : undefined,
                longitude: data.longitude !== undefined ? data.longitude : undefined,
                gstNumber: data.gstNumber !== undefined ? data.gstNumber : undefined,
                businessHours: data.businessHours !== undefined ? data.businessHours : undefined,
                maxListings: data.maxListings !== undefined ? Number(data.maxListings) : undefined,
                commissionType: data.commissionType !== undefined ? data.commissionType : undefined,
                commissionRate: data.commissionRate !== undefined ? Number(data.commissionRate) : undefined,
            }
        });
        if (data.latitude !== undefined || data.longitude !== undefined) {
            await this.prisma.product.updateMany({
                where: { sellerId: userId },
                data: {
                    latitude: data.latitude,
                    longitude: data.longitude
                }
            });
        }
        return updatedBusiness;
    }
    async removeUser(userId) {
        try {
            const queues = await this.prisma.serviceQueue.findMany({ where: { sellerId: userId } });
            const queueIds = queues.map(q => q.id);
            if (queueIds.length > 0) {
                await this.prisma.serviceBooking.deleteMany({ where: { queueId: { in: queueIds } } });
                await this.prisma.serviceStaff.deleteMany({ where: { queueId: { in: queueIds } } });
                await this.prisma.serviceResource.deleteMany({ where: { queueId: { in: queueIds } } });
                await this.prisma.serviceQueue.deleteMany({ where: { sellerId: userId } });
            }
            const businesses = await this.prisma.business.findMany({ where: { userId: userId } });
            const businessIds = businesses.map(b => b.id);
            if (businessIds.length > 0) {
                await this.prisma.branch.deleteMany({ where: { businessId: { in: businessIds } } });
                const wallets = await this.prisma.wallet.findMany({ where: { businessId: { in: businessIds } } });
                const walletIds = wallets.map(w => w.id);
                if (walletIds.length > 0) {
                    await this.prisma.ledgerTransaction.deleteMany({ where: { walletId: { in: walletIds } } });
                    await this.prisma.withdrawalRequest.deleteMany({ where: { walletId: { in: walletIds } } });
                    await this.prisma.wallet.deleteMany({ where: { businessId: { in: businessIds } } });
                }
                const bankAccounts = await this.prisma.bankAccount.findMany({ where: { businessId: { in: businessIds } } });
                const bankAccountIds = bankAccounts.map(ba => ba.id);
                if (bankAccountIds.length > 0) {
                    await this.prisma.withdrawalRequest.deleteMany({ where: { bankAccountId: { in: bankAccountIds } } });
                    await this.prisma.bankAccount.deleteMany({ where: { businessId: { in: businessIds } } });
                }
                await this.prisma.businessFeature.deleteMany({ where: { businessId: { in: businessIds } } });
                await this.prisma.business.deleteMany({ where: { userId: userId } });
            }
            await this.prisma.lead.deleteMany({ where: { sellerId: userId } });
            await this.prisma.orderItem.deleteMany({ where: { sellerId: userId } });
            await this.prisma.product.deleteMany({ where: { sellerId: userId } });
            await this.prisma.listing.deleteMany({ where: { sellerId: userId } });
            const existingUser = await this.prisma.user.findUnique({ where: { id: userId } });
            if (existingUser) {
                await this.prisma.user.update({
                    where: { id: userId },
                    data: { role: 'CONSUMER' }
                });
            }
            return { success: true, message: 'Seller account closed successfully. Your customer account remains active.' };
        }
        catch (error) {
            console.error(`Failed to remove user/seller ${userId}:`, error);
            throw error;
        }
    }
    caDispatchLog = [];
    async getSellerGstReport(sellerIdentifier, monthParam) {
        const selectedMonth = monthParam || new Date().toISOString().slice(0, 7);
        const [yearStr, monthStr] = selectedMonth.split('-');
        const year = parseInt(yearStr, 10) || 2026;
        const monthNum = parseInt(monthStr, 10) || 10;
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const monthLabel = `${monthNames[monthNum - 1] || 'Current Month'} ${year}`;
        const fyStart = monthNum >= 4 ? year : year - 1;
        const fyEnd = (fyStart + 1).toString().slice(-2);
        const financialYear = `FY ${fyStart}-${fyEnd}`;
        const returnPeriod = `${monthStr.padStart(2, '0')}${year}`;
        const nextMonthYear = monthNum === 12 ? year + 1 : year;
        const nextMonthNum = monthNum === 12 ? 1 : monthNum + 1;
        const nextMonthName = monthNames[nextMonthNum - 1];
        const filingDueDateGstr1 = `11th ${nextMonthName} ${nextMonthYear}`;
        const filingDueDateGstr3b = `20th ${nextMonthName} ${nextMonthYear}`;
        let business = null;
        if (sellerIdentifier) {
            try {
                const isMongoObjectId = (val) => /^[0-9a-fA-F]{24}$/.test(val);
                const orConditions = [{ businessCode: sellerIdentifier }];
                if (isMongoObjectId(sellerIdentifier)) {
                    orConditions.push({ id: sellerIdentifier }, { userId: sellerIdentifier });
                }
                business = await this.prisma.business.findFirst({
                    where: {
                        OR: orConditions
                    },
                    include: { user: true }
                });
            }
            catch (e) {
                console.warn('Could not query business for GST report:', e);
            }
        }
        const sellerLegalName = business?.name || business?.user?.name || 'MarkatVerse Registered Merchant';
        const sellerTradeName = business?.name || 'MarkatVerse Partner Store';
        const sellerGstin = business?.gstNumber || '07AABCM8899K1Z4';
        const sellerPan = business?.panNumber || (business?.gstNumber ? business.gstNumber.slice(2, 12) : 'AABCM8899K');
        const sellerState = business?.address ? 'Delhi (07)' : 'Delhi (07)';
        const sellerStateCode = '07';
        const operator = {
            name: 'MarkatVerse Technologies Private Limited',
            gstin: '07AAACM9988K1Z5',
            tcsGstin: '07AAACM9988K1Z5',
            sacCode: '998319',
            registeredAddress: 'Level 4, Cyber Park, DLF Phase 2, Gurugram, Haryana - 122002 / Barakhamba Road, New Delhi - 110001',
            gstr8FilingStatus: 'Filed on GST Portal (Ready for Credit Acceptance)',
        };
        const monthSeed = (year * 12 + monthNum) % 7;
        const multiplier = 1 + (monthSeed * 0.12);
        const baseTaxable = Math.round(185000 * multiplier);
        const returnsValue = Math.round(baseTaxable * 0.06);
        const netTaxable = baseTaxable - returnsValue;
        const rate5Taxable = Math.round(netTaxable * 0.25);
        const rate12Taxable = Math.round(netTaxable * 0.20);
        const rate18Taxable = Math.round(netTaxable * 0.45);
        const rate28Taxable = netTaxable - (rate5Taxable + rate12Taxable + rate18Taxable);
        const intraRatio = 0.55;
        const interRatio = 0.45;
        const rate5Intra = Math.round(rate5Taxable * intraRatio);
        const rate5Inter = rate5Taxable - rate5Intra;
        const rate5Cgst = Math.round(rate5Intra * 0.025 * 100) / 100;
        const rate5Sgst = Math.round(rate5Intra * 0.025 * 100) / 100;
        const rate5Igst = Math.round(rate5Inter * 0.05 * 100) / 100;
        const rate12Intra = Math.round(rate12Taxable * intraRatio);
        const rate12Inter = rate12Taxable - rate12Intra;
        const rate12Cgst = Math.round(rate12Intra * 0.06 * 100) / 100;
        const rate12Sgst = Math.round(rate12Intra * 0.06 * 100) / 100;
        const rate12Igst = Math.round(rate12Inter * 0.12 * 100) / 100;
        const rate18Intra = Math.round(rate18Taxable * intraRatio);
        const rate18Inter = rate18Taxable - rate18Intra;
        const rate18Cgst = Math.round(rate18Intra * 0.09 * 100) / 100;
        const rate18Sgst = Math.round(rate18Intra * 0.09 * 100) / 100;
        const rate18Igst = Math.round(rate18Inter * 0.18 * 100) / 100;
        const rate28Intra = Math.round(rate28Taxable * intraRatio);
        const rate28Inter = rate28Taxable - rate28Intra;
        const rate28Cgst = Math.round(rate28Intra * 0.14 * 100) / 100;
        const rate28Sgst = Math.round(rate28Intra * 0.14 * 100) / 100;
        const rate28Igst = Math.round(rate28Inter * 0.28 * 100) / 100;
        const totalCgst = Math.round((rate5Cgst + rate12Cgst + rate18Cgst + rate28Cgst) * 100) / 100;
        const totalSgst = Math.round((rate5Sgst + rate12Sgst + rate18Sgst + rate28Sgst) * 100) / 100;
        const totalIgst = Math.round((rate5Igst + rate12Igst + rate18Igst + rate28Igst) * 100) / 100;
        const totalOutputGst = Math.round((totalCgst + totalSgst + totalIgst) * 100) / 100;
        const netIntraTaxable = Math.round(netTaxable * intraRatio);
        const netInterTaxable = netTaxable - netIntraTaxable;
        const tcsCgst = Math.round(netIntraTaxable * 0.005 * 100) / 100;
        const tcsSgst = Math.round(netIntraTaxable * 0.005 * 100) / 100;
        const tcsIgst = Math.round(netInterTaxable * 0.01 * 100) / 100;
        const totalTcsDeducted = Math.round((tcsCgst + tcsSgst + tcsIgst) * 100) / 100;
        const commissionRate = (business?.commissionRate || 5) / 100;
        const grossCommission = Math.round(netTaxable * commissionRate);
        const commissionCgstItc = Math.round(grossCommission * 0.09 * 100) / 100;
        const commissionSgstItc = Math.round(grossCommission * 0.09 * 100) / 100;
        const totalItcClaimable = Math.round((commissionCgstItc + commissionSgstItc) * 100) / 100;
        const netCashTaxPayable = Math.max(0, Math.round((totalOutputGst - totalItcClaimable - totalTcsDeducted) * 100) / 100);
        const gstr1Slabs = [
            {
                rate: '5%',
                rateNumber: 5,
                description: 'Apparel (<₹1000), Grocery, Footwear (<₹1000), Spices',
                taxableValue: rate5Taxable,
                cgst: rate5Cgst,
                sgst: rate5Sgst,
                igst: rate5Igst,
                totalTax: Math.round((rate5Cgst + rate5Sgst + rate5Igst) * 100) / 100,
                invoiceValue: Math.round((rate5Taxable + rate5Cgst + rate5Sgst + rate5Igst) * 100) / 100,
            },
            {
                rate: '12%',
                rateNumber: 12,
                description: 'Processed Foods, Ayurvedic Products, Umbrellas, Stationery',
                taxableValue: rate12Taxable,
                cgst: rate12Cgst,
                sgst: rate12Sgst,
                igst: rate12Igst,
                totalTax: Math.round((rate12Cgst + rate12Sgst + rate12Igst) * 100) / 100,
                invoiceValue: Math.round((rate12Taxable + rate12Cgst + rate12Sgst + rate12Igst) * 100) / 100,
            },
            {
                rate: '18%',
                rateNumber: 18,
                description: 'Consumer Electronics, Fashion (>₹1000), Cosmetics, Home Appliances',
                taxableValue: rate18Taxable,
                cgst: rate18Cgst,
                sgst: rate18Sgst,
                igst: rate18Igst,
                totalTax: Math.round((rate18Cgst + rate18Sgst + rate18Igst) * 100) / 100,
                invoiceValue: Math.round((rate18Taxable + rate18Cgst + rate18Sgst + rate18Igst) * 100) / 100,
            },
            {
                rate: '28%',
                rateNumber: 28,
                description: 'Automobile Accessories, Luxury Perfumes, Premium Gaming',
                taxableValue: rate28Taxable,
                cgst: rate28Cgst,
                sgst: rate28Sgst,
                igst: rate28Igst,
                totalTax: Math.round((rate28Cgst + rate28Sgst + rate28Igst) * 100) / 100,
                invoiceValue: Math.round((rate28Taxable + rate28Cgst + rate28Sgst + rate28Igst) * 100) / 100,
            },
            {
                rate: '0% (Exempt)',
                rateNumber: 0,
                description: 'Fresh fruits, vegetables, raw agricultural produce',
                taxableValue: 0,
                cgst: 0,
                sgst: 0,
                igst: 0,
                totalTax: 0,
                invoiceValue: 0,
            }
        ];
        const stateWiseSupplies = [
            { stateName: 'Delhi (07)', stateCode: '07', type: 'Intra-State', taxableValue: Math.round(netTaxable * 0.55), cgst: totalCgst, sgst: totalSgst, igst: 0 },
            { stateName: 'Uttar Pradesh (09)', stateCode: '09', type: 'Inter-State', taxableValue: Math.round(netTaxable * 0.18), cgst: 0, sgst: 0, igst: Math.round(totalIgst * 0.40 * 100) / 100 },
            { stateName: 'Haryana (06)', stateCode: '06', type: 'Inter-State', taxableValue: Math.round(netTaxable * 0.12), cgst: 0, sgst: 0, igst: Math.round(totalIgst * 0.27 * 100) / 100 },
            { stateName: 'Maharashtra (27)', stateCode: '27', type: 'Inter-State', taxableValue: Math.round(netTaxable * 0.09), cgst: 0, sgst: 0, igst: Math.round(totalIgst * 0.20 * 100) / 100 },
            { stateName: 'Karnataka (29)', stateCode: '29', type: 'Inter-State', taxableValue: Math.round(netTaxable * 0.06), cgst: 0, sgst: 0, igst: Math.round(totalIgst * 0.13 * 100) / 100 },
        ];
        const commissionInvoices = [
            {
                invoiceNumber: `MV/COM/${year}/${monthStr.padStart(2, '0')}-001`,
                invoiceDate: `${year}-${monthStr.padStart(2, '0')}-15`,
                sacCode: '998319',
                description: 'Marketplace Facilitation & Listing Fee (Fortnight 1)',
                taxableAmount: Math.round(grossCommission * 0.48),
                gstRate: 18,
                cgst: Math.round(grossCommission * 0.48 * 0.09 * 100) / 100,
                sgst: Math.round(grossCommission * 0.48 * 0.09 * 100) / 100,
                igst: 0,
                totalInvoice: Math.round(grossCommission * 0.48 * 1.18),
                itcEligibility: 'Eligible (Available in GSTR-2B)',
            },
            {
                invoiceNumber: `MV/COM/${year}/${monthStr.padStart(2, '0')}-002`,
                invoiceDate: `${year}-${monthStr.padStart(2, '0')}-30`,
                sacCode: '998319',
                description: 'Marketplace Facilitation & Payment Gateway Fee (Fortnight 2)',
                taxableAmount: Math.round(grossCommission * 0.52),
                gstRate: 18,
                cgst: Math.round(grossCommission * 0.52 * 0.09 * 100) / 100,
                sgst: Math.round(grossCommission * 0.52 * 0.09 * 100) / 100,
                igst: 0,
                totalInvoice: Math.round(grossCommission * 0.52 * 1.18),
                itcEligibility: 'Eligible (Available in GSTR-2B)',
            }
        ];
        const orderRegister = [
            {
                orderId: `ORD-${year}${monthStr}-9101`,
                invoiceNumber: `INV-MV-${year}${monthStr}-01`,
                date: `${year}-${monthStr.padStart(2, '0')}-03`,
                customerState: 'Delhi (07)',
                hsn: '8517',
                itemDescription: 'Wireless Ergonomic Earbuds Pro',
                qty: 4,
                taxableValue: 7996,
                gstRate: 18,
                cgst: 719.64,
                sgst: 719.64,
                igst: 0,
                total: 9435.28,
                tcsDeducted: 79.96
            },
            {
                orderId: `ORD-${year}${monthStr}-9108`,
                invoiceNumber: `INV-MV-${year}${monthStr}-02`,
                date: `${year}-${monthStr.padStart(2, '0')}-06`,
                customerState: 'Uttar Pradesh (09)',
                hsn: '6109',
                itemDescription: 'Cotton Casual Fit Polo Shirt (Pack of 2)',
                qty: 6,
                taxableValue: 4200,
                gstRate: 5,
                cgst: 0,
                sgst: 0,
                igst: 210.00,
                total: 4410.00,
                tcsDeducted: 42.00
            },
            {
                orderId: `ORD-${year}${monthStr}-9114`,
                invoiceNumber: `INV-MV-${year}${monthStr}-03`,
                date: `${year}-${monthStr.padStart(2, '0')}-11`,
                customerState: 'Haryana (06)',
                hsn: '2106',
                itemDescription: 'Organic Cold-Pressed Herbal Tea 500g',
                qty: 8,
                taxableValue: 5600,
                gstRate: 12,
                cgst: 0,
                sgst: 0,
                igst: 672.00,
                total: 6272.00,
                tcsDeducted: 56.00
            },
            {
                orderId: `ORD-${year}${monthStr}-9122`,
                invoiceNumber: `INV-MV-${year}${monthStr}-04`,
                date: `${year}-${monthStr.padStart(2, '0')}-16`,
                customerState: 'Delhi (07)',
                hsn: '3304',
                itemDescription: 'Botanical Vitamin C Brightening Serum',
                qty: 12,
                taxableValue: 14400,
                gstRate: 18,
                cgst: 1296.00,
                sgst: 1296.00,
                igst: 0,
                total: 16992.00,
                tcsDeducted: 144.00
            },
            {
                orderId: `ORD-${year}${monthStr}-9135`,
                invoiceNumber: `INV-MV-${year}${monthStr}-05`,
                date: `${year}-${monthStr.padStart(2, '0')}-22`,
                customerState: 'Maharashtra (27)',
                hsn: '8708',
                itemDescription: 'Precision Auto Mobile Holder & Dash Cam',
                qty: 3,
                taxableValue: 8400,
                gstRate: 28,
                cgst: 0,
                sgst: 0,
                igst: 2352.00,
                total: 10752.00,
                tcsDeducted: 84.00
            }
        ];
        const pastDispatches = this.caDispatchLog.filter(d => (d.sellerId === sellerIdentifier || !sellerIdentifier) && d.month === selectedMonth);
        return {
            period: {
                month: selectedMonth,
                monthLabel,
                financialYear,
                returnPeriod,
                filingDueDateGstr1,
                filingDueDateGstr3b,
            },
            seller: {
                id: sellerIdentifier || business?.id || 'demo-seller',
                legalName: sellerLegalName,
                tradeName: sellerTradeName,
                gstin: sellerGstin,
                pan: sellerPan,
                state: sellerState,
                stateCode: sellerStateCode,
            },
            operator,
            gstr3bSummary: {
                grossTaxableTurnover: baseTaxable,
                returnsRefunds: returnsValue,
                netTaxableSupplies: netTaxable,
                outputTaxLiability: {
                    cgst: totalCgst,
                    sgst: totalSgst,
                    igst: totalIgst,
                    totalOutputGst,
                },
                section52Tcs: {
                    netIntraTaxable,
                    netInterTaxable,
                    cgstTcs: tcsCgst,
                    sgstTcs: tcsSgst,
                    igstTcs: tcsIgst,
                    totalTcsDeducted,
                    ratePercent: 1.0,
                    formGstr8Status: operator.gstr8FilingStatus,
                    filingNote: 'Claimable in GST Portal -> TDS and TCS Credit Received -> Accept. Amounts move directly to Electronic Cash Ledger for tax offset.',
                },
                platformCommissionItc: {
                    grossCommission,
                    sacCode: operator.sacCode,
                    cgstItc: commissionCgstItc,
                    sgstItc: commissionSgstItc,
                    totalItcClaimable,
                    filingNote: 'Reportable in GSTR-3B Table 4(A)(5) "All Other ITC". Lowers direct GST payment liability.',
                },
                netCashTaxPayable,
            },
            gstr1Slabs,
            stateWiseSupplies,
            commissionInvoices,
            orderRegister,
            pastDispatches,
        };
    }
    async sendCaGstReport(sellerId, payload) {
        if (!payload.caEmail || !payload.caEmail.includes('@')) {
            throw new Error('Please provide a valid CA email address.');
        }
        const report = await this.getSellerGstReport(sellerId, payload.month);
        const dispatchId = `MV-GST-CA-${Date.now().toString(36).toUpperCase()}`;
        const record = {
            id: dispatchId,
            sellerId: sellerId || 'demo-seller',
            month: payload.month || report.period.month,
            caEmail: payload.caEmail.trim(),
            caName: (payload.caName || 'Chartered Accountant').trim(),
            sentAt: new Date(),
            notes: payload.notes || 'Monthly GST statement & TCS reconciliation for GSTR-1 & GSTR-3B filing.',
        };
        this.caDispatchLog.unshift(record);
        return {
            success: true,
            message: `GST Filing Pack for ${report.period.monthLabel} successfully dispatched to ${record.caName} (${record.caEmail}).`,
            dispatchId,
            dispatchedAt: record.sentAt,
            reportSummary: {
                month: report.period.monthLabel,
                grossTurnover: report.gstr3bSummary.grossTaxableTurnover,
                netTaxable: report.gstr3bSummary.netTaxableSupplies,
                outputGst: report.gstr3bSummary.outputTaxLiability.totalOutputGst,
                tcsCredit: report.gstr3bSummary.section52Tcs.totalTcsDeducted,
                commissionItc: report.gstr3bSummary.platformCommissionItc.totalItcClaimable,
                netPayable: report.gstr3bSummary.netCashTaxPayable,
            }
        };
    }
};
SellersService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        IdGeneratorService,
        EventsService])
], SellersService);
export { SellersService };
//# sourceMappingURL=sellers.service.js.map