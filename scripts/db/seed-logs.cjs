const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  await prisma.notificationLog.createMany({
    data: [
      { userId: '1234567890abcdef12345678', userType: 'CUSTOMER', channel: 'EMAIL', triggerType: 'ORDER_PROCESSING', recipient: 'customer@example.com', title: 'Order #9876 is processing', message: 'Your order is now being processed.', status: 'SENT' },
      { userId: '1234567890abcdef12345678', userType: 'CUSTOMER', channel: 'SMS', triggerType: 'ORDER_PROCESSING', recipient: '+1234567890', title: 'MarkatVerse Update', message: 'Your order #9876 is processing.', status: 'SENT' },
      { userId: 'abcdef1234567890abcdef12', userType: 'SELLER', channel: 'PUSH', triggerType: 'BUSINESS_REGISTERED', recipient: 'device-xyz', title: 'Registration Under Review', message: 'Welcome! Your business is under review.', status: 'SENT' },
    ]
  });
  console.log('Seeded notification history.');
}
seed().catch(console.error).finally(() => prisma.$disconnect());
