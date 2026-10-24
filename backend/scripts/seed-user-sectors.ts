import { PrismaClient, MainType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding specific BusinessTypes and Sectors requested by user...');

  // 1. Create BusinessTypes if they don't exist
  const b2bType = await prisma.businessType.upsert({
    where: { id: '000000000000000000000001' }, // Dummy ID to avoid unique constraint if we don't have unique names. Wait, we don't have unique constraint on name.
    // Let's just create or find first by name.
    create: { mainType: 'B2B', name: 'Product B2B', description: 'Business to Business Products' },
    update: {},
  }).catch(async () => await prisma.businessType.findFirst({ where: { name: 'Product B2B' } }) ?? await prisma.businessType.create({ data: { mainType: 'B2B', name: 'Product B2B' } }));

  const b2cType = await prisma.businessType.findFirst({ where: { name: 'Product B2C' } }) 
    ?? await prisma.businessType.create({ data: { mainType: 'B2C', name: 'Product B2C' } });

  const bothType = await prisma.businessType.findFirst({ where: { name: 'Both B2B & B2C' } }) 
    ?? await prisma.businessType.create({ data: { mainType: 'BOTH', name: 'Both B2B & B2C' } });

  const serviceType = await prisma.businessType.findFirst({ where: { name: 'Service Provider' } }) 
    ?? await prisma.businessType.create({ data: { mainType: 'SERVICE', name: 'Service Provider' } });

  // 2. Define the sectors we want to show up in the Admin Panel
  const targetSectors = [
    { name: 'Product B2B', businessTypeId: b2bType.id, description: 'Controls the B2B wholesale platform globally' },
    { name: 'Product B2C', businessTypeId: b2cType.id, description: 'Controls the B2C retail platform globally' },
    { name: 'Product Both B2B & B2C', businessTypeId: bothType.id, description: 'Controls dual-mode product sellers' },
    { name: 'Salon', businessTypeId: serviceType.id, description: 'Salon and Beauty Services' },
    { name: 'Transport', businessTypeId: serviceType.id, description: 'Transport and Travel Services' },
    { name: 'Automobile & Car Wash', businessTypeId: serviceType.id, description: 'Car Wash, Auto Detailing, and Vehicle Repair Services' },
    { name: 'Home', businessTypeId: serviceType.id, description: 'Home Services (Plumbing, Electrician, etc.)' },
    { name: 'Events', businessTypeId: serviceType.id, description: 'Event Organizations' },
  ];

  for (const ts of targetSectors) {
    const existing = await prisma.sector.findFirst({ where: { name: ts.name } });
    if (!existing) {
      await prisma.sector.create({
        data: {
          name: ts.name,
          businessTypeId: ts.businessTypeId,
          description: ts.description,
          isActive: true
        }
      });
      console.log(`Created sector: ${ts.name}`);
    } else {
      await prisma.sector.update({
        where: { id: existing.id },
        data: {
          businessTypeId: ts.businessTypeId,
          description: ts.description
        }
      });
      console.log(`Updated sector: ${ts.name}`);
    }
  }

  // Cleanup old sectors if we want to keep it strictly to these (optional, let's just make sure these exist)
  console.log('Seeding complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
