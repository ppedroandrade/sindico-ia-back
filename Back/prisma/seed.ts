import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sindico.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@sindico.com',
      password: adminPassword,
      role: 'admin',
      active: true,
    },
  });

  console.log('Seed seguro concluído', {
    admin: admin.email,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
