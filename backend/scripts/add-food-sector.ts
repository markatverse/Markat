import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const serviceType = await prisma.businessType.findFirst({
    where: { mainType: 'SERVICE' }
  });

  if (!serviceType) {
    console.log('SERVICE business type not found');
    return;
  }

  // Create Food sector
  const foodSector = await prisma.sector.create({
    data: {
      name: 'Food',
      description: 'Restaurants and Cafes for online booking',
      businessTypeId: serviceType.id,
      isActive: true,
      parameters: {
        features: {
          bookingQueue: true,
          shoppingCart: false,
          b2bQuotes: false,
          liveChat: true,
          reviews: true
        }
      }
    }
  });

  console.log(`Created Food sector with ID: ${foodSector.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
