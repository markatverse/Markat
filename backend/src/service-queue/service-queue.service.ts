import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { IdGeneratorService } from '../id-generator/id-generator.service.js';

@Injectable()
export class ServiceQueueService {
  constructor(
    private prisma: PrismaService,
    private idGenerator: IdGeneratorService
  ) {}

  // ─── Queue Management ────────────────────────────────────────────────────────

  /** Create a new queue for a service */
  async createQueue(data: {
    shopName: string;
    avgMinutes?: number;
    pricePerHour?: number;
    sellerId?: string;
  }) {
    const safeSellerId = data.sellerId || Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    return this.prisma.serviceQueue.create({
      data: {
        shopName: data.shopName,
        avgMinutes: data.avgMinutes ?? 20,
        pricePerHour: data.pricePerHour ?? 0,
        currentToken: 0,
        lastToken: 0,
        isOpen: true,
        sellerId: safeSellerId,
      },
    });
  }

  /** Helper to validate MongoDB 24-char hex ObjectId */
  private isValidObjectId(id: string): boolean {
    return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
  }

  /** Get queue by seller */
  async getQueueBySeller(sellerId: string) {
    if (!this.isValidObjectId(sellerId)) {
      return null;
    }
    return this.prisma.serviceQueue.findFirst({
      where: { sellerId },
    });
  }

  /** Get all queues (for listing services) */
  async getAllQueues() {
    return this.prisma.serviceQueue.findMany({
      where: { isOpen: true, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Get live status of a queue */
  async getQueueStatus(queueId: string) {
    if (!this.isValidObjectId(queueId)) {
      throw new NotFoundException('Invalid queue ID format');
    }
    const queue = await this.prisma.serviceQueue.findUnique({
      where: { id: queueId },
      include: {
        staff: true,
        resources: true,
      }
    });
    if (!queue) throw new NotFoundException('Queue not found');

    // Fetch all waitings, both tokens and appointments that are checked in or pending
    // We treat CHECKED_IN appointments as part of the live waiting queue
    const waiting = await this.prisma.serviceBooking.findMany({
      where: { queueId, status: { in: ['WAITING', 'CHECKED_IN', 'PENDING'] } },
      orderBy: [
        { appointmentTime: 'asc' }, // Appointments first by time if they exist
        { tokenNumber: 'asc' } // Then tokens by number
      ],
    });

    const serving = await this.prisma.serviceBooking.findMany({
      where: { queueId, status: 'SERVING' },
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const doneToday = await this.prisma.serviceBooking.count({
      where: { queueId, status: 'DONE', doneAt: { gte: todayStart } },
    });

    return {
      queue,
      staff: queue.staff,
      resources: queue.resources,
      serving,
      waiting,
      waitingCount: waiting.length,
      doneToday,
      estimatedWaitForNext: waiting.length > 0 ? queue.avgMinutes : 0,
    };
  }

  // ─── Token/Appointment Management ─────────────────────────────────────────────────────────

  /** Customer joins the queue (Walk-in Token OR Pre-scheduled Appointment) */
  async joinQueue(
    queueId: string,
    data: { 
      customerName: string; 
      phone?: string; 
      service?: string; 
      bookingMode?: string; 
      appointmentTime?: string;
      staffName?: string;
      staffId?: string;
      resourceId?: string;
    },
  ) {
    const queue = await this.prisma.serviceQueue.findUnique({
      where: { id: queueId },
    });
    if (!queue) throw new NotFoundException('Queue not found');

    const mode = data.bookingMode || 'TOKEN';

    let tokenNumber = null;
    let status = 'WAITING';

    if (mode === 'TOKEN') {
      if (!queue.isOpen) throw new NotFoundException('This service queue is closed for walk-ins');
      
      const updated = await this.prisma.serviceQueue.update({
        where: { id: queueId },
        data: { lastToken: { increment: 1 } },
      });
      tokenNumber = updated.lastToken;
    } else {
      // APPOINTMENT
      status = 'PENDING';
    }

    // How many tokens/checked-in are ahead?
    const ahead = await this.prisma.serviceBooking.count({
      where: { queueId, status: { in: ['WAITING', 'CHECKED_IN'] } },
    });

    const estimatedWaitMin = mode === 'TOKEN' ? ahead * queue.avgMinutes : 0;
    const bookingNumber = await this.idGenerator.generateBookingId(mode === 'TOKEN');

    const token = await this.prisma.serviceBooking.create({
      data: {
        bookingNumber,
        queueId,
        tokenNumber,
        bookingMode: mode,
        appointmentTime: data.appointmentTime ? new Date(data.appointmentTime) : null,
        customerName: data.customerName,
        phone: data.phone,
        service: data.service ?? 'General',
        staffName: data.staffName,
        staffId: data.staffId,
        resourceId: data.resourceId,
        status: status,
      },
    });

    return { token, estimatedWaitMin, ahead };
  }

  /** Check in an appointment */
  async checkIn(tokenId: string) {
    const token = await this.prisma.serviceBooking.findUnique({
      where: { id: tokenId },
    });
    if (!token) throw new NotFoundException('Booking not found');

    return this.prisma.serviceBooking.update({
      where: { id: tokenId },
      data: { status: 'CHECKED_IN' },
    });
  }

  /** Get a single token's status with full queue context (for customer tracking) */
  async getTokenStatus(tokenId: string) {
    const token = await this.prisma.serviceBooking.findUnique({
      where: { id: tokenId },
      include: { queue: true },
    });
    if (!token) throw new NotFoundException('Booking not found');

    const queue = token.queue;

    const ahead = await this.prisma.serviceBooking.count({
      where: {
        queueId: token.queueId,
        status: { in: ['WAITING', 'CHECKED_IN'] },
        // if tokenNumber exists, count where tokenNumber is less. If not, count where appointment time is earlier.
        tokenNumber: token.tokenNumber ? { lt: token.tokenNumber } : undefined,
        appointmentTime: token.appointmentTime ? { lt: token.appointmentTime } : undefined,
      },
    });

    const serving = await this.prisma.serviceBooking.findFirst({
      where: { queueId: token.queueId, status: 'SERVING' },
    });

    const estimatedWaitMin =
      ['WAITING', 'CHECKED_IN'].includes(token.status)
        ? ahead * queue.avgMinutes + (serving ? queue.avgMinutes : 0)
        : 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const recentDone = await this.prisma.serviceBooking.findMany({
      where: { queueId: token.queueId, status: 'DONE', doneAt: { gte: todayStart } },
      orderBy: { doneAt: 'desc' },
      take: 5,
    });

    const waitingTokens = await this.prisma.serviceBooking.findMany({
      where: { queueId: token.queueId, status: { in: ['WAITING', 'CHECKED_IN', 'ABSENT'] } },
      orderBy: [
        { appointmentTime: 'asc' },
        { tokenNumber: 'asc' }
      ],
    });

    const doneToday = await this.prisma.serviceBooking.count({
      where: { queueId: token.queueId, status: 'DONE', doneAt: { gte: todayStart } },
    });

    return {
      token,
      ahead,
      serving,
      estimatedWaitMin,
      queue,
      recentDone: recentDone.reverse(),
      waitingTokens,
      doneToday,
    };
  }

  // ─── ServiceQueue Staff Actions ──────────────────────────────────────────────────────

  /** Call the next customer (Mixing appointments and tokens depending on policy) */
  async callNext(queueId: string, resourceId?: string, staffId?: string) {
    const queue = await this.prisma.serviceQueue.findUnique({
      where: { id: queueId },
    });
    if (!queue) throw new NotFoundException('Queue not found');

    // If resourceId is provided, mark currently serving token on THAT resource as DONE
    const whereServing: any = { queueId, status: 'SERVING' };
    if (resourceId) whereServing.resourceId = resourceId;

    const currentlyServing = await this.prisma.serviceBooking.findFirst({
      where: whereServing,
    });

    if (currentlyServing) {
      await this.prisma.serviceBooking.update({
        where: { id: currentlyServing.id },
        data: { status: 'DONE', doneAt: new Date() },
      });
      await this.applyCommission(currentlyServing.id, queue.sellerId);
    }

    // Prioritize active on-time customers first (WAITING or CHECKED_IN)
    let nextToken = await this.prisma.serviceBooking.findFirst({
      where: { queueId, status: { in: ['WAITING', 'CHECKED_IN'] } },
      orderBy: [
        { appointmentTime: 'asc' },
        { tokenNumber: 'asc' }
      ],
    });

    // If no active waiting customers, fallback to late/absent tokens
    if (!nextToken) {
      nextToken = await this.prisma.serviceBooking.findFirst({
        where: { queueId, status: 'ABSENT' },
        orderBy: [
          { appointmentTime: 'asc' },
          { tokenNumber: 'asc' }
        ],
      });
    }

    if (!nextToken) {
      // No more waiting — update currentToken to last
      await this.prisma.serviceQueue.update({
        where: { id: queueId },
        data: { currentToken: queue.lastToken },
      });
      return { message: 'Queue is empty', serving: null };
    }

    // Mark next token as SERVING on the selected resource/staff
    const serving = await this.prisma.serviceBooking.update({
      where: { id: nextToken.id },
      data: { 
        status: 'SERVING', 
        servedAt: new Date(),
        resourceId: resourceId || undefined,
        staffId: staffId || undefined,
      },
    });

    // Update the queue's global current token if it's a token
    if (nextToken.bookingMode === 'TOKEN' && nextToken.tokenNumber) {
      await this.prisma.serviceQueue.update({
        where: { id: queueId },
        data: { currentToken: nextToken.tokenNumber },
      });
    }

    return { message: 'Next customer called', serving };
  }

  /** Mark a token as NO_SHOW */
  async markNoShow(tokenId: string) {
    const token = await this.prisma.serviceBooking.findUnique({
      where: { id: tokenId },
    });
    if (!token) throw new NotFoundException('Booking not found');

    return this.prisma.serviceBooking.update({
      where: { id: tokenId },
      data: { status: 'NO_SHOW', doneAt: new Date() },
    });
  }

  /** Mark a token as ABSENT (late but stays in queue) */
  async markAbsent(tokenId: string) {
    const token = await this.prisma.serviceBooking.findUnique({
      where: { id: tokenId },
    });
    if (!token) throw new NotFoundException('Booking not found');

    return this.prisma.serviceBooking.update({
      where: { id: tokenId },
      data: { status: 'ABSENT', resourceId: null },
    });
  }

  /** Mark a token as WAITING (Return to queue from absent) */
  async markWaiting(tokenId: string) {
    const token = await this.prisma.serviceBooking.findUnique({
      where: { id: tokenId },
    });
    if (!token) throw new NotFoundException('Booking not found');

    return this.prisma.serviceBooking.update({
      where: { id: tokenId },
      data: { status: 'WAITING' },
    });
  }

  /** Start serving a specific token directly (e.g. Start Wash / Call into Bay) */
  async startServing(tokenId: string, resourceId?: string) {
    const token = await this.prisma.serviceBooking.findUnique({
      where: { id: tokenId },
    });
    if (!token) throw new NotFoundException('Booking not found');

    let targetResourceId = resourceId || token.resourceId;
    if (!targetResourceId && token.queueId && (this.prisma as any).queueResource) {
      const resource = await (this.prisma as any).queueResource.findFirst({
        where: { queueId: token.queueId, isActive: true },
      });
      if (resource) targetResourceId = resource.id;
    }

    const updated = await this.prisma.serviceBooking.update({
      where: { id: tokenId },
      data: {
        status: 'SERVING',
        servedAt: new Date(),
        resourceId: targetResourceId || undefined,
      },
    });

    if (token.queueId && token.bookingMode === 'TOKEN' && token.tokenNumber) {
      await this.prisma.serviceQueue.update({
        where: { id: token.queueId },
        data: { currentToken: token.tokenNumber },
      });
    }

    return updated;
  }

  /** Mark a token as DONE manually */
  async markDone(tokenId: string) {
    const booking = await this.prisma.serviceBooking.update({
      where: { id: tokenId },
      data: { status: 'DONE', doneAt: new Date() },
    });
    const queue = await this.prisma.serviceQueue.findUnique({ where: { id: booking.queueId } });
    if (queue) {
      await this.applyCommission(booking.id, queue.sellerId);
    }
    return booking;
  }

  /** Get today's stats for a queue */
  async getTodayStats(queueId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [done, noShow, waiting, serving, queue] = await Promise.all([
      this.prisma.serviceBooking.count({
        where: { queueId, status: 'DONE', doneAt: { gte: todayStart } },
      }),
      this.prisma.serviceBooking.count({
        where: { queueId, status: 'NO_SHOW', doneAt: { gte: todayStart } },
      }),
      this.prisma.serviceBooking.count({
        where: { queueId, status: { in: ['WAITING', 'CHECKED_IN'] } },
      }),
      this.prisma.serviceBooking.count({
        where: { queueId, status: 'SERVING' },
      }),
      this.prisma.serviceQueue.findUnique({ where: { id: queueId } }),
    ]);

    const totalHours = (done * (queue?.avgMinutes ?? 20)) / 60;
    const estimatedRevenue = totalHours * (queue?.pricePerHour ?? 0);

    return { done, noShow, waiting, serving, totalHours, estimatedRevenue, queue };
  }

  /** Update queue settings */
  async updateQueueSettings(
    queueId: string,
    data: { 
      avgMinutes?: number; 
      pricePerHour?: number; 
      isOpen?: boolean; 
      shopName?: string;
      enableTokens?: boolean;
      enableAppointments?: boolean;
      queuePolicy?: string;
    },
  ) {
    return this.prisma.serviceQueue.update({
      where: { id: queueId },
      data,
    });
  }

  /** Reset queue (clear all tokens for a new day) */
  async resetQueue(queueId: string) {
    await this.prisma.serviceBooking.deleteMany({ where: { queueId } });
    return this.prisma.serviceQueue.update({
      where: { id: queueId },
      data: { currentToken: 0, lastToken: 0 },
    });
  }

  // ─── Staff & Resources ───────────────────────────────────────────────────

  async addStaff(queueId: string, data: any) {
    return this.prisma.serviceStaff.create({
      data: {
        queueId,
        name: data.name,
        role: data.role,
        imageUrl: data.imageUrl,
        services: data.services || [],
      }
    });
  }

  async deleteStaff(queueId: string, staffId: string) {
    return this.prisma.serviceStaff.delete({
      where: { id: staffId }
    });
  }

  async addResource(queueId: string, data: any) {
    return this.prisma.serviceResource.create({
      data: {
        queueId,
        name: data.name,
        type: data.type || 'Chair',
        capacity: data.capacity || 1,
        services: data.services || [],
        assignedStaffId: data.assignedStaffId,
      }
    });
  }

  async deleteResource(queueId: string, resourceId: string) {
    return this.prisma.serviceResource.delete({
      where: { id: resourceId }
    });
  }

  /** Update admin status (ACTIVE | SUSPENDED) */
  async updateAdminStatus(queueId: string, status: string) {
    return this.prisma.serviceQueue.update({
      where: { id: queueId },
      data: { status },
    });
  }

  // ─── Analytics ───────────────────────────────────────────────────────────────

  async getAnalytics(queueId: string) {
    if (!this.isValidObjectId(queueId)) {
      throw new NotFoundException('Invalid queue ID format');
    }
    const queue = await this.prisma.serviceQueue.findUnique({
      where: { id: queueId },
      include: { staff: true }
    });
    if (!queue) throw new NotFoundException('Queue not found');

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [todayBookings, monthBookings] = await Promise.all([
      this.prisma.serviceBooking.findMany({
        where: { queueId, status: 'DONE', doneAt: { gte: todayStart } }
      }),
      this.prisma.serviceBooking.findMany({
        where: { queueId, status: 'DONE', doneAt: { gte: monthStart } }
      })
    ]);

    const todayEarnings = todayBookings.reduce((sum: number, b: any) => sum + (b.price || 0), 0);
    const monthEarnings = monthBookings.reduce((sum: number, b: any) => sum + (b.price || 0), 0);

    const staffStats = queue.staff.map((staff: any) => {
      const staffToday = todayBookings.filter((b: any) => b.staffId === staff.id);
      const staffMonth = monthBookings.filter((b: any) => b.staffId === staff.id);
      
      return {
        id: staff.id,
        name: staff.name,
        todayCustomers: staffToday.length,
        todayEarnings: staffToday.reduce((sum: number, b: any) => sum + (b.price || 0), 0),
        monthCustomers: staffMonth.length,
        monthEarnings: staffMonth.reduce((sum: number, b: any) => sum + (b.price || 0), 0)
      };
    });

    return {
      totalTodayCollection: todayEarnings,
      totalMonthCollection: monthEarnings,
      staffPerformance: staffStats
    };
  }

  private async applyCommission(bookingId: string, sellerId: string | null) {
    if (!sellerId) return;

    try {
      const booking = await this.prisma.serviceBooking.findUnique({ where: { id: bookingId } });
      if (!booking || booking.price <= 0) return;

      const business = await this.prisma.business.findUnique({
        where: { userId: sellerId },
        include: { wallet: true }
      });
      if (!business) return;

      let amountOwed = 0;
      if (business.commissionType === 'PERCENTAGE') {
        amountOwed = booking.price * (business.commissionRate / 100);
      } else if (business.commissionType === 'FIXED') {
        // Fixed fee per transaction
        amountOwed = business.commissionRate;
      }

      if (amountOwed > 0) {
        if (business.wallet) {
          await this.prisma.wallet.update({
            where: { id: business.wallet.id },
            data: { owedToPlatform: { increment: amountOwed } }
          });
        } else {
          await this.prisma.wallet.create({
            data: {
              businessId: business.id,
              owedToPlatform: amountOwed
            }
          });
        }
      }
    } catch (err) {
      console.error('Failed to apply commission', err);
    }
  }
}
