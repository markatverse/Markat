import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { IdGeneratorService } from '../id-generator/id-generator.service.js';
import { EventsService } from '../events/events.service.js';

@Injectable()
export class SellersService {
  constructor(
    private prisma: PrismaService,
    private idGenerator: IdGeneratorService,
    private eventsService: EventsService,
  ) {}

  async create(seller: any, userId?: string) {
    // Find user: prefer looking up by JWT userId (most reliable)
    let user = null;
    if (userId) {
      user = await this.prisma.user.findUnique({ where: { id: userId } });
    }

    // Fallback: find by email or phone from payload
    if (!user && (seller.email || seller.phone)) {
      user = await this.prisma.user.findFirst({
        where: {
          OR: [
            seller.email ? { email: seller.email } : undefined,
            seller.phone ? { phone: seller.phone } : undefined,
          ].filter(Boolean) as any,
        },
      });
    }

    // If no user found, create one
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
    } else {
      // Update role to SELLER
      await this.prisma.user.update({
        where: { id: user.id },
        data: { role: 'SELLER' },
      });
    }

    // Check if business already exists for this user
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
        // Must do sequentially or use Promise.all to generate staff codes
        const staffData = await Promise.all(seller.staff.map(async (s: any) => ({
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
          data: seller.resources.map((r: any) => ({
            queueId: queue.id,
            name: r.name,
            type: r.type,
          })),
        });
      }
    }

    // Phase 2 Automation: Trigger auto-verification
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
    const businesses = await this.prisma.business.findMany({
      include: { user: { select: { name: true, email: true, phone: true, role: true } } },
      orderBy: { createdAt: 'desc' }
    });

    return businesses.map(b => ({
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
    }));
  }

  async updateStatus(id: string, status: string, kycData?: { kycCallStatus?: string; kycNotes?: string }) {
    const isApproved = status === 'Approved' || status === 'APPROVED';
    const isRejected = status === 'Rejected' || status === 'REJECTED';
    
    const updateData: any = {
      verified: isApproved,
      verificationStatus: isApproved ? 'APPROVED' : (isRejected ? 'REJECTED' : 'PENDING'),
    };

    if (kycData?.kycCallStatus) {
      updateData.kycCallStatus = kycData.kycCallStatus;
    } else if (isApproved) {
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

  async updateKyc(id: string, data: { kycCallStatus?: string; kycNotes?: string }) {
    const business = await this.prisma.business.update({
      where: { id },
      data: {
        kycCallStatus: data.kycCallStatus,
        kycNotes: data.kycNotes,
      },
    });
    return business;
  }

  async updateUser(userId: string, data: any) {
    const business = await this.prisma.business.findUnique({ where: { userId } });
    if (!business) throw new Error('Business not found');
    
    // Also update user if needed
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

  async removeUser(userId: string) {
    // 1. Delete ServiceQueues and related
    try {
      const queues = await this.prisma.serviceQueue.findMany({ where: { sellerId: userId } });
      const queueIds = queues.map(q => q.id);
      if (queueIds.length > 0) {
        await this.prisma.serviceBooking.deleteMany({ where: { queueId: { in: queueIds } } });
        await this.prisma.serviceStaff.deleteMany({ where: { queueId: { in: queueIds } } });
        await this.prisma.serviceResource.deleteMany({ where: { queueId: { in: queueIds } } });
        await this.prisma.serviceQueue.deleteMany({ where: { sellerId: userId } });
      }

      // 2. Delete Businesses and related
      const businesses = await this.prisma.business.findMany({ where: { userId: userId } });
      const businessIds = businesses.map(b => b.id);
      if (businessIds.length > 0) {
        // Delete business branches
        await this.prisma.branch.deleteMany({ where: { businessId: { in: businessIds } } });

        // Delete wallets and associated transactions
        const wallets = await this.prisma.wallet.findMany({ where: { businessId: { in: businessIds } } });
        const walletIds = wallets.map(w => w.id);
        if (walletIds.length > 0) {
          await this.prisma.ledgerTransaction.deleteMany({ where: { walletId: { in: walletIds } } });
          await this.prisma.withdrawalRequest.deleteMany({ where: { walletId: { in: walletIds } } });
          await this.prisma.wallet.deleteMany({ where: { businessId: { in: businessIds } } });
        }
        
        // Delete bank accounts and associated withdrawal requests
        const bankAccounts = await this.prisma.bankAccount.findMany({ where: { businessId: { in: businessIds } } });
        const bankAccountIds = bankAccounts.map(ba => ba.id);
        if (bankAccountIds.length > 0) {
          await this.prisma.withdrawalRequest.deleteMany({ where: { bankAccountId: { in: bankAccountIds } } });
          await this.prisma.bankAccount.deleteMany({ where: { businessId: { in: businessIds } } });
        }

        // Delete business features
        await this.prisma.businessFeature.deleteMany({ where: { businessId: { in: businessIds } } });
        await this.prisma.business.deleteMany({ where: { userId: userId } });
      }

      // 3. Delete Seller Leads (keep buyer leads so customer history is preserved)
      await this.prisma.lead.deleteMany({ where: { sellerId: userId } });

      // 4. Delete Products and related seller order items
      await this.prisma.orderItem.deleteMany({ where: { sellerId: userId } });
      await this.prisma.product.deleteMany({ where: { sellerId: userId } });

      // 5. Delete Listings
      await this.prisma.listing.deleteMany({ where: { sellerId: userId } });

      // 6. Demote User role to CONSUMER so customer account remains active and preserved
      const existingUser = await this.prisma.user.findUnique({ where: { id: userId } });
      if (existingUser) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { role: 'CONSUMER' }
        });
      }

      return { success: true, message: 'Seller account closed successfully. Your customer account remains active.' };
    } catch (error: any) {
      console.error(`Failed to remove user/seller ${userId}:`, error);
      throw error;
    }
  }
}
