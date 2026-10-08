import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const idsToDelete = [
    '6aa8bda82b951435fb34d777', // salon
    '6aa8bda82b951435fb34d779', // transport
    '6aa8bda82b951435fb34d775', // b2b
    '6aa8bda82b951435fb34d776', // home
    '6aa8bda82b951435fb34d778', // events
    '6ac6f1eaf2d0830eee604c7c', // B2C (old)
  ];

  for (const id of idsToDelete) {
    try {
      await prisma.sector.delete({ where: { id } });
      console.log(`Deleted sector ${id}`);
    } catch (e) {
      console.log(`Could not delete ${id}:`, e.message);
    }
  }

  console.log('Cleanup done!');
}

main().finally(() => prisma.$disconnect());
