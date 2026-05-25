import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);

  await prisma.chatMessage.deleteMany();
  await prisma.aiConversation.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.occurrence.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.areaItem.deleteMany();
  await prisma.commonArea.deleteMany();
  await prisma.user.deleteMany({
    where: {
      email: {
        not: 'admin@sindico.com',
      },
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sindico.com' },
    update: {
      name: 'Administrador',
      password: adminPassword,
      role: 'admin',
      apartment: null,
    },
    create: {
      name: 'Administrador',
      email: 'admin@sindico.com',
      password: adminPassword,
      role: 'admin',
    },
  });

  console.log('Seed mínimo concluído', {
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
