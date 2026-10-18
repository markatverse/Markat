const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDB() {
  console.log("Starting DB wipe for test data...");
  try {
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.lead.deleteMany({});
    await prisma.serviceBooking.deleteMany({});
    await prisma.serviceResource.deleteMany({});
    await prisma.serviceStaff.deleteMany({});
    await prisma.serviceQueue.deleteMany({});
    await prisma.listing.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.ledgerTransaction.deleteMany({});
    await prisma.withdrawalRequest.deleteMany({});
    await prisma.bankAccount.deleteMany({});
    await prisma.wallet.deleteMany({});
    await prisma.businessFeature.deleteMany({});
    await prisma.business.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.userInteraction.deleteMany({});
    await prisma.complaint.deleteMany({});
    
    // Delete non-admin users
    const result = await prisma.user.deleteMany({
      where: {
        role: {
          notIn: ['ADMIN', 'SUPERADMIN']
        }
      }
    });
    console.log(`Deleted ${result.count} non-admin users.`);
    console.log("Database wiped successfully. Admins and configuration settings (Categories, etc.) retained.");
  } catch (err) {
    console.error("Error wiping DB:", err);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDB();
