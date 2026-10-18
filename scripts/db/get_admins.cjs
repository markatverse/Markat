const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAdmins() {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPERADMIN']
        }
      },
      select: {
        email: true,
        phone: true,
        role: true,
        password: true
      }
    });
    console.log(JSON.stringify(admins, null, 2));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

getAdmins();
