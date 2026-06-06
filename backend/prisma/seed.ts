import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@ropáconhistoria.com';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existing) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        name: 'Administrador',
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
        creditPercentage: 0,
        cashPercentage: 100,
      },
    });
    console.log('Admin user created:', adminEmail, '/ admin123');
  } else {
    console.log('Admin already exists');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
