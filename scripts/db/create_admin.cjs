const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const admin = await prisma.user.upsert({
      where: { email: 'superadmin@markatverse.com' },
      update: {
        password: '$2b$10$pVeD5r7EwL6I9VQY372.WeB41HU9MFHjSsp7474rEtnDsHcDZ/Sf.', // admin123
        role: 'SUPERADMIN'
      },
      create: {
        email: 'superadmin@markatverse.com',
        phone: '0000000000',
        name: 'Super Admin',
        password: '$2b$10$pVeD5r7EwL6I9VQY372.WeB41HU9MFHjSsp7474rEtnDsHcDZ/Sf.', // admin123
        role: 'SUPERADMIN'
      }
    });
    console.log("Admin created successfully:", admin.email);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
