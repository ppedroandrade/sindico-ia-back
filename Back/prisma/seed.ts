import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const logger = new Logger();
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // --- Criar usuários ---
  const adminPassword = await bcrypt.hash('admin123', 10);
  const moradorPassword = await bcrypt.hash('morador123', 10);
  const limpezaPassword = await bcrypt.hash('limpeza123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sindico.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@sindico.com',
      password: adminPassword,
      role: 'admin',
    },
  });

  const morador = await prisma.user.upsert({
    where: { email: 'morador@condominio.com' },
    update: {},
    create: {
      name: 'Morador Teste',
      email: 'morador@condominio.com',
      password: moradorPassword,
      role: 'morador',
      apartment: '101A',
    },
  });

  const limpeza = await prisma.user.upsert({
    where: { email: 'limpeza@condominio.com' },
    update: {},
    create: {
      name: 'Equipe de Limpeza',
      email: 'limpeza@condominio.com',
      password: limpezaPassword,
      role: 'limpeza',
    },
  });

  console.log('👥 Usuários criados:', { admin, morador, limpeza });

  // --- Criar áreas comuns ---
  const area = await prisma.commonArea.upsert({
    where: { name: 'Salão de Festas' },
    update: {},
    create: {
      name: 'Salão de Festas',
      description: 'Espaço amplo com churrasqueira e mesas.',
      capacity: 40,
      pricePerHour: 80,
      available: true,
      items: {
        create: [
          {
            name: 'Mesa de Madeira',
            quantity: 8,
            unitPrice: 120,
            category: 'furniture',
          },
          {
            name: 'Cadeiras de Plástico',
            quantity: 40,
            unitPrice: 30,
            category: 'furniture',
          },
          {
            name: 'Freezer',
            quantity: 1,
            unitPrice: 800,
            category: 'electronics',
          },
        ],
      },
    },
  });

  console.log('🏢 Área comum criada:', area.name);

  console.log('✅ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    logger.error('Prisma connection error', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
