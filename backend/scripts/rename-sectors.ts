import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Renaming Product Sectors...');

  const updates = [
    { oldName: 'Product B2B', newName: 'B2B' },
    { oldName: 'Product B2C', newName: 'B2C' },
    { oldName: 'Product Both B2B & B2C', newName: 'Both B2B & B2C' },
  ];

  for (const update of updates) {
    const sector = await prisma.sector.findFirst({ where: { name: update.oldName } });
    if (sector) {
      await prisma.sector.update({
        where: { id: sector.id },
        data: { name: update.newName }
      });
      console.log(`Renamed ${update.oldName} to ${update.newName}`);
    }
  }

  console.log('Done!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
