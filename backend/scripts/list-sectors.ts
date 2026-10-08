import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sectors = await prisma.sector.findMany({
    include: { businessType: true }
  });

  console.log('--- ALL SECTORS ---');
  sectors.forEach(s => {
    console.log(`ID: ${s.id}, Name: ${s.name}, BusinessType: ${s.businessType?.mainType || 'NULL'}`);
  });
}

main().finally(() => prisma.$disconnect());
