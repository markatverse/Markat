const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash('Manish@2026', 10);
    const emails = ['markatverse@gmalil.com', 'markatverse@gmail.com', 'superadmin@markatverse.com'];

    for (const email of emails) {
      const admin = await prisma.user.upsert({
        where: { email },
        update: {
          password: passwordHash,
          role: 'SUPER_ADMIN'
        },
        create: {
          email,
          phone: email === 'markatverse@gmalil.com' ? '0000965776' : (email === 'markatverse@gmail.com' ? '0000158430' : '0000000000'),
          name: 'Super Admin',
          password: passwordHash,
          role: 'SUPER_ADMIN'
        }
      });
      console.log("Admin configured successfully:", admin.email, admin.role);
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
