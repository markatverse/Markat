const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findFirst({ where: { markatId: 'MV-0000000024' } });
  console.log(user);
}
main().catch(console.error).finally(() => prisma.$disconnect());
