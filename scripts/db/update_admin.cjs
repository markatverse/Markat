const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAdmin() {
  try {
    const admin = await prisma.user.update({
      where: { email: 'superadmin@markatverse.com' },
      data: {
        role: 'SUPER_ADMIN'
      }
    });
    console.log("Admin updated successfully:", admin.role);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdmin();
