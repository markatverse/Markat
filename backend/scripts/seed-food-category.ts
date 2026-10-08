import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const foodSector = await prisma.sector.findFirst({
    where: { name: 'Food' }
  });

  if (!foodSector) {
    console.log('Food sector not found');
    return;
  }

  // Check if category exists
  let category = await prisma.category.findFirst({
    where: { name: 'Restaurants & Cafes' }
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'Restaurants & Cafes',
        theme: 'rose',
        icon: 'Pizza',
        primaryType: 'SERVICE',
        sectorId: foodSector.id,
        parameters: {
          features: ['Appointment', 'B2C'],
        }
      }
    });
    console.log(`Created Restaurants & Cafes category with ID: ${category.id}`);
  } else {
    // Update it with sectorId
    await prisma.category.update({
      where: { id: category.id },
      data: { sectorId: foodSector.id, primaryType: 'SERVICE' }
    });
    console.log(`Updated Restaurants & Cafes category with ID: ${category.id}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
