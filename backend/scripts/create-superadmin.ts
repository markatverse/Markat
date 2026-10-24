import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Manish@2026', 10);

  const adminEmails = ['markatverse@gmalil.com', 'markatverse@gmail.com'];

  for (const email of adminEmails) {
    const existing = await prisma.user.findFirst({
      where: { email },
    });

    if (existing) {
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          role: 'SUPER_ADMIN',
          password: passwordHash,
          name: 'Super Admin',
        },
      });
      console.log(`Updated existing user to SUPER_ADMIN: ${updated.email}`);
    } else {
      // Find a safe unused phone number
      let phone = `0000${Math.floor(100000 + Math.random() * 900000)}`;
      while (await prisma.user.findFirst({ where: { phone } })) {
        phone = `0000${Math.floor(100000 + Math.random() * 900000)}`;
      }

      const created = await prisma.user.create({
        data: {
          email,
          name: 'Super Admin',
          phone,
          password: passwordHash,
          role: 'SUPER_ADMIN',
          markatId: `SA-${Math.floor(10000 + Math.random() * 90000)}`,
        },
      });
      console.log(`Created new SUPER_ADMIN user: ${created.email} (phone: ${phone})`);
    }
  }

  // Also query to print all admins
  const admins = await prisma.user.findMany({
    where: {
      role: {
        in: ['SUPER_ADMIN', 'ADMIN', 'super_admin']
      }
    },
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
      name: true
    }
  });

  console.log('Current Admin Accounts in DB:');
  console.log(JSON.stringify(admins, null, 2));
}

main()
  .catch((e) => {
    console.error('Error creating super admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
