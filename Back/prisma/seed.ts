import {
  AccessStatus,
  AnnouncementType,
  AssemblyStatus,
  MaintenanceStatus,
  OccurrencePriority,
  OccurrenceStatus,
  PackageStatus,
  PrismaClient,
  ReservationStatus,
  Role,
  UnitOccupancyType,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const demoPassword = 'Senha@123';

function date(value: string) {
  return new Date(`${value}T00:00:00-03:00`);
}

function dateTime(value: string) {
  return new Date(`${value}:00-03:00`);
}

async function resetDatabase() {
  await prisma.notification.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.aiConversation.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.assemblyVote.deleteMany();
  await prisma.assembly.deleteMany();
  await prisma.maintenanceOrder.deleteMany();
  await prisma.packageDelivery.deleteMany();
  await prisma.visitorAccess.deleteMany();
  await prisma.occurrenceComment.deleteMany();
  await prisma.occurrence.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.areaItem.deleteMany();
  await prisma.commonArea.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.parkingSpace.deleteMany();
  await prisma.unitResident.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.condominiumSettings.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await resetDatabase();

  const password = await bcrypt.hash(demoPassword, 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Mariana Costa',
      email: 'admin@sindico.com',
      username: 'mariana.sindica',
      password,
      role: Role.admin,
      cpf: '12345678901',
      active: true,
    },
  });

  const limpeza = await prisma.user.create({
    data: {
      name: 'Joao Pereira',
      email: 'limpeza@sindico.com',
      username: 'joao.limpeza',
      password,
      role: Role.limpeza,
      cpf: '23456789012',
      active: true,
    },
  });

  const auxiliarLimpeza = await prisma.user.create({
    data: {
      name: 'Patricia Alves',
      email: 'patricia.limpeza@sindico.com',
      username: 'patricia.limpeza',
      password,
      role: Role.limpeza,
      cpf: '34567890123',
      active: true,
    },
  });

  const moradores = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Carlos Almeida',
        email: 'morador@sindico.com',
        username: 'carlos.almeida',
        password,
        role: Role.morador,
        cpf: '45678901234',
        apartment: 'A-101',
        parkingSpaces: ['V-01'],
        active: true,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Fernanda Rocha',
        email: 'fernanda.rocha@email.com',
        username: 'fernanda.rocha',
        password,
        role: Role.morador,
        cpf: '56789012345',
        apartment: 'A-102',
        parkingSpaces: ['V-02'],
        active: true,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Rafael Martins',
        email: 'rafael.martins@email.com',
        username: 'rafael.martins',
        password,
        role: Role.morador,
        cpf: '67890123456',
        apartment: 'B-201',
        parkingSpaces: ['V-14'],
        active: true,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Luciana Nogueira',
        email: 'luciana.nogueira@email.com',
        username: 'luciana.nogueira',
        password,
        role: Role.morador,
        cpf: '78901234567',
        apartment: 'B-202',
        parkingSpaces: ['V-15'],
        active: true,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Thiago Moreira',
        email: 'thiago.moreira@email.com',
        username: 'thiago.moreira',
        password,
        role: Role.morador,
        cpf: '89012345678',
        apartment: 'C-301',
        parkingSpaces: ['V-28'],
        active: true,
      },
    }),
  ]);

  await prisma.condominiumSettings.create({
    data: {
      id: 'main',
      name: 'Condominio Jardim Aurora',
      cnpj: '12.345.678/0001-90',
      address: 'Rua das Palmeiras, 450 - Vila Mariana, Sao Paulo - SP',
      phone: '(11) 4002-8922',
      email: 'administracao@jardimaurora.com.br',
      totalUnits: 96,
    },
  });

  const units = await Promise.all([
    prisma.unit.create({
      data: {
        block: 'A',
        number: '101',
        floor: '1',
        fraction: 1.03,
        ownerId: moradores[0].id,
        notes: 'Unidade proxima ao hall social',
      },
    }),
    prisma.unit.create({
      data: {
        block: 'A',
        number: '102',
        floor: '1',
        fraction: 1.01,
        ownerId: moradores[1].id,
        notes: 'Possui deposito no subsolo',
      },
    }),
    prisma.unit.create({
      data: {
        block: 'B',
        number: '201',
        floor: '2',
        fraction: 1.08,
        ownerId: moradores[2].id,
      },
    }),
    prisma.unit.create({
      data: {
        block: 'B',
        number: '202',
        floor: '2',
        fraction: 1.08,
        ownerId: moradores[3].id,
      },
    }),
    prisma.unit.create({
      data: {
        block: 'C',
        number: '301',
        floor: '3',
        fraction: 1.15,
        ownerId: moradores[4].id,
        notes: 'Cobertura duplex',
      },
    }),
  ]);

  await Promise.all(
    moradores.map((morador, index) =>
      prisma.unitResident.create({
        data: {
          unitId: units[index].id,
          userId: morador.id,
          type:
            index === 1 ? UnitOccupancyType.tenant : UnitOccupancyType.owner,
          isPrimary: true,
        },
      }),
    ),
  );

  await Promise.all([
    prisma.parkingSpace.create({
      data: { code: 'V-01', unitId: units[0].id, notes: 'Subsolo 1' },
    }),
    prisma.parkingSpace.create({
      data: { code: 'V-02', unitId: units[1].id, notes: 'Subsolo 1' },
    }),
    prisma.parkingSpace.create({
      data: { code: 'V-14', unitId: units[2].id, notes: 'Subsolo 2' },
    }),
    prisma.parkingSpace.create({
      data: { code: 'V-15', unitId: units[3].id, notes: 'Subsolo 2' },
    }),
    prisma.parkingSpace.create({
      data: { code: 'V-28', unitId: units[4].id, notes: 'Vaga coberta' },
    }),
    prisma.parkingSpace.create({
      data: { code: 'V-29', notes: 'Vaga de visitantes' },
    }),
  ]);

  await Promise.all([
    prisma.vehicle.create({
      data: {
        userId: moradores[0].id,
        plate: 'ABC1D23',
        model: 'Honda Civic',
        color: 'Prata',
        parkingSpace: 'V-01',
      },
    }),
    prisma.vehicle.create({
      data: {
        userId: moradores[1].id,
        plate: 'BRA2E45',
        model: 'Jeep Compass',
        color: 'Preto',
        parkingSpace: 'V-02',
      },
    }),
    prisma.vehicle.create({
      data: {
        userId: moradores[4].id,
        plate: 'SPC3F67',
        model: 'Toyota Corolla',
        color: 'Branco',
        parkingSpace: 'V-28',
      },
    }),
    prisma.pet.create({
      data: {
        userId: moradores[0].id,
        name: 'Nina',
        species: 'Cachorro',
        breed: 'Shih-tzu',
        notes: 'Vacinacao em dia',
      },
    }),
    prisma.pet.create({
      data: {
        userId: moradores[2].id,
        name: 'Mingau',
        species: 'Gato',
        breed: 'SRD',
        notes: 'Nao sai da unidade',
      },
    }),
  ]);

  const [salao, gourmet, churrasqueira, coworking, quadra] = await Promise.all([
    prisma.commonArea.create({
      data: {
        name: 'Salao de Festas',
        description: 'Espaco climatizado com cozinha, mesas e sistema de som.',
        capacity: 80,
        pricePerHour: 120,
        items: {
          create: [
            {
              name: 'Mesa redonda',
              quantity: 12,
              unitPrice: 180,
              category: 'Mobiliario',
            },
            {
              name: 'Cadeira acolchoada',
              quantity: 80,
              unitPrice: 45,
              category: 'Mobiliario',
            },
            {
              name: 'Projetor',
              quantity: 1,
              unitPrice: 2600,
              category: 'Audio e video',
            },
          ],
        },
      },
    }),
    prisma.commonArea.create({
      data: {
        name: 'Espaco Gourmet',
        description: 'Ambiente para jantares e eventos menores.',
        capacity: 30,
        pricePerHour: 90,
        items: {
          create: [
            {
              name: 'Cooktop',
              quantity: 1,
              unitPrice: 1400,
              category: 'Eletrodomesticos',
            },
            {
              name: 'Adega climatizada',
              quantity: 1,
              unitPrice: 3200,
              category: 'Eletrodomesticos',
            },
          ],
        },
      },
    }),
    prisma.commonArea.create({
      data: {
        name: 'Churrasqueira',
        description: 'Area aberta com churrasqueira, freezer e bancadas.',
        capacity: 25,
        pricePerHour: 70,
        items: {
          create: [
            {
              name: 'Freezer horizontal',
              quantity: 1,
              unitPrice: 2100,
              category: 'Eletrodomesticos',
            },
            {
              name: 'Grelha inox',
              quantity: 2,
              unitPrice: 350,
              category: 'Utensilios',
            },
          ],
        },
      },
    }),
    prisma.commonArea.create({
      data: {
        name: 'Coworking',
        description: 'Sala compartilhada com internet, mesas e televisao.',
        capacity: 12,
        pricePerHour: 0,
        items: {
          create: [
            {
              name: 'Mesa de trabalho',
              quantity: 6,
              unitPrice: 900,
              category: 'Mobiliario',
            },
            {
              name: 'Monitor 27 polegadas',
              quantity: 2,
              unitPrice: 1300,
              category: 'Tecnologia',
            },
          ],
        },
      },
    }),
    prisma.commonArea.create({
      data: {
        name: 'Quadra Poliesportiva',
        description: 'Quadra para futebol, basquete e volei.',
        capacity: 20,
        pricePerHour: 40,
        items: {
          create: [
            {
              name: 'Rede de volei',
              quantity: 1,
              unitPrice: 240,
              category: 'Esporte',
            },
            {
              name: 'Bolas oficiais',
              quantity: 4,
              unitPrice: 180,
              category: 'Esporte',
            },
          ],
        },
      },
    }),
  ]);

  await Promise.all([
    prisma.reservation.create({
      data: {
        userId: moradores[0].id,
        areaId: salao.id,
        date: date('2026-08-02'),
        startTime: dateTime('2026-08-02T18:00'),
        endTime: dateTime('2026-08-02T23:00'),
        totalPrice: 600,
        guests: 45,
        status: ReservationStatus.confirmed,
        observations:
          'Aniversario infantil. Solicitou liberacao de fornecedor de buffet.',
      },
    }),
    prisma.reservation.create({
      data: {
        userId: moradores[1].id,
        areaId: gourmet.id,
        date: date('2026-08-05'),
        startTime: dateTime('2026-08-05T19:00'),
        endTime: dateTime('2026-08-05T22:00'),
        totalPrice: 270,
        guests: 18,
        status: ReservationStatus.pending,
        observations: 'Jantar de familia.',
      },
    }),
    prisma.reservation.create({
      data: {
        userId: moradores[2].id,
        areaId: churrasqueira.id,
        date: date('2026-07-20'),
        startTime: dateTime('2026-07-20T12:00'),
        endTime: dateTime('2026-07-20T17:00'),
        totalPrice: 350,
        guests: 20,
        status: ReservationStatus.completed,
        observations: 'Evento realizado sem ocorrencias.',
      },
    }),
    prisma.reservation.create({
      data: {
        userId: moradores[3].id,
        areaId: quadra.id,
        date: date('2026-08-01'),
        startTime: dateTime('2026-08-01T09:00'),
        endTime: dateTime('2026-08-01T11:00'),
        totalPrice: 80,
        guests: 10,
        status: ReservationStatus.confirmed,
        observations: 'Jogo entre moradores dos blocos A e B.',
      },
    }),
  ]);

  await Promise.all([
    prisma.payment.create({
      data: {
        userId: moradores[0].id,
        amount: 780.5,
        dueDate: date('2026-07-10'),
        paidDate: date('2026-07-08'),
        status: 'paid',
        type: 'condominio',
        referenceMonth: '2026-07',
      },
    }),
    prisma.payment.create({
      data: {
        userId: moradores[1].id,
        amount: 812.2,
        dueDate: date('2026-07-10'),
        status: 'overdue',
        type: 'condominio',
        referenceMonth: '2026-07',
      },
    }),
    prisma.payment.create({
      data: {
        userId: moradores[2].id,
        amount: 765.9,
        dueDate: date('2026-08-10'),
        status: 'pending',
        type: 'condominio',
        referenceMonth: '2026-08',
      },
    }),
    prisma.payment.create({
      data: {
        userId: moradores[3].id,
        amount: 120,
        dueDate: date('2026-08-05'),
        status: 'pending',
        type: 'reserva',
        referenceMonth: '2026-08',
      },
    }),
    prisma.payment.create({
      data: {
        userId: moradores[4].id,
        amount: 94.35,
        dueDate: date('2026-07-25'),
        paidDate: date('2026-07-24'),
        status: 'paid',
        type: 'agua',
        referenceMonth: '2026-07',
      },
    }),
    prisma.payment.create({
      data: {
        userId: moradores[1].id,
        amount: 63.8,
        dueDate: date('2026-08-15'),
        status: 'pending',
        type: 'gas',
        referenceMonth: '2026-08',
      },
    }),
  ]);

  await Promise.all([
    prisma.announcement.create({
      data: {
        title: 'Manutencao preventiva dos elevadores',
        content:
          'Na proxima sexta-feira os elevadores dos blocos A e B passarao por revisao preventiva entre 9h e 13h.',
        type: AnnouncementType.warning,
        publishAt: dateTime('2026-07-28T08:00'),
        authorId: admin.id,
      },
    }),
    prisma.announcement.create({
      data: {
        title: 'Assembleia ordinaria de agosto',
        content:
          'A assembleia discutira previsao orcamentaria, melhorias na portaria e aprovacao de obras de acessibilidade.',
        type: AnnouncementType.event,
        publishAt: dateTime('2026-07-29T10:00'),
        authorId: admin.id,
      },
    }),
    prisma.announcement.create({
      data: {
        title: 'Uso consciente da agua',
        content:
          'O consumo do condominio subiu 18% em julho. Verifique vazamentos e evite lavagem de sacadas fora dos horarios permitidos.',
        type: AnnouncementType.info,
        publishAt: dateTime('2026-07-25T09:00'),
        authorId: admin.id,
      },
    }),
    prisma.announcement.create({
      data: {
        title: 'Interdicao temporaria da churrasqueira',
        content:
          'A churrasqueira ficara interditada em 03/08 para troca do revestimento da bancada.',
        type: AnnouncementType.urgent,
        publishAt: dateTime('2026-07-29T14:00'),
        authorId: admin.id,
      },
    }),
  ]);

  const [occurrence1, occurrence2, occurrence3, occurrence4] =
    await Promise.all([
      prisma.occurrence.create({
        data: {
          title: 'Infiltracao na garagem do bloco A',
          description:
            'Ha gotejamento constante proximo as vagas V-01 e V-02 apos chuvas fortes.',
          category: 'Manutencao predial',
          priority: OccurrencePriority.high,
          status: OccurrenceStatus.in_progress,
          reporterId: moradores[0].id,
          assigneeId: admin.id,
        },
      }),
      prisma.occurrence.create({
        data: {
          title: 'Barulho apos horario permitido',
          description:
            'Som alto vindo do apartamento B-202 depois das 23h durante o fim de semana.',
          category: 'Convivencia',
          priority: OccurrencePriority.medium,
          status: OccurrenceStatus.open,
          reporterId: moradores[2].id,
          assigneeId: admin.id,
        },
      }),
      prisma.occurrence.create({
        data: {
          title: 'Lampada queimada na escada de emergencia',
          description:
            'Escada do bloco C esta com pouca iluminacao entre o 2o e 3o andar.',
          category: 'Seguranca',
          priority: OccurrencePriority.urgent,
          status: OccurrenceStatus.resolved,
          reporterId: moradores[4].id,
          assigneeId: limpeza.id,
        },
      }),
      prisma.occurrence.create({
        data: {
          title: 'Portao social demorando para fechar',
          description:
            'Portao fica aberto por mais de 25 segundos apos entrada de visitantes.',
          category: 'Portaria',
          priority: OccurrencePriority.high,
          status: OccurrenceStatus.open,
          reporterId: moradores[1].id,
          assigneeId: admin.id,
        },
      }),
    ]);

  await Promise.all([
    prisma.occurrenceComment.create({
      data: {
        occurrenceId: occurrence1.id,
        authorId: admin.id,
        content: 'Fornecedor hidraulico acionado para vistoria ainda hoje.',
      },
    }),
    prisma.occurrenceComment.create({
      data: {
        occurrenceId: occurrence1.id,
        authorId: moradores[0].id,
        content:
          'Enviei fotos atualizadas da garagem pelo grupo da administracao.',
      },
    }),
    prisma.occurrenceComment.create({
      data: {
        occurrenceId: occurrence3.id,
        authorId: limpeza.id,
        content: 'Lampada substituida e teste realizado no circuito.',
      },
    }),
    prisma.occurrenceComment.create({
      data: {
        occurrenceId: occurrence4.id,
        authorId: admin.id,
        content:
          'Tecnico da empresa de controle de acesso agendado para sexta-feira.',
      },
    }),
    prisma.occurrenceComment.create({
      data: {
        occurrenceId: occurrence2.id,
        authorId: admin.id,
        content: 'Notificacao preventiva sera enviada ao morador responsavel.',
      },
    }),
  ]);

  await Promise.all([
    prisma.visitorAccess.create({
      data: {
        unitId: units[0].id,
        residentId: moradores[0].id,
        visitorName: 'Bruno Ferreira',
        document: 'RG 32.456.789-0',
        phone: '(11) 98888-1010',
        purpose: 'Buffet para evento',
        company: 'Sabor & Festa Eventos',
        expectedAt: dateTime('2026-08-02T16:30'),
        status: AccessStatus.scheduled,
        notes: 'Liberar acesso pela garagem de servico.',
      },
    }),
    prisma.visitorAccess.create({
      data: {
        unitId: units[1].id,
        residentId: moradores[1].id,
        visitorName: 'Camila Santos',
        document: 'CNH 04567890123',
        phone: '(11) 97777-2020',
        purpose: 'Visita familiar',
        expectedAt: dateTime('2026-07-29T19:00'),
        checkedInAt: dateTime('2026-07-29T19:08'),
        status: AccessStatus.checked_in,
      },
    }),
    prisma.visitorAccess.create({
      data: {
        unitId: units[4].id,
        residentId: moradores[4].id,
        visitorName: 'Equipe NetFiber',
        company: 'NetFiber Telecom',
        purpose: 'Instalacao de internet',
        expectedAt: dateTime('2026-07-28T10:00'),
        checkedInAt: dateTime('2026-07-28T10:12'),
        checkedOutAt: dateTime('2026-07-28T11:35'),
        status: AccessStatus.checked_out,
      },
    }),
  ]);

  await Promise.all([
    prisma.packageDelivery.create({
      data: {
        unitId: units[0].id,
        recipientName: 'Carlos Almeida',
        carrier: 'Mercado Livre',
        trackingCode: 'MLB123456789',
        receivedAt: dateTime('2026-07-29T11:20'),
        status: PackageStatus.notified,
        notes: 'Pacote medio armazenado na portaria.',
      },
    }),
    prisma.packageDelivery.create({
      data: {
        unitId: units[2].id,
        recipientName: 'Rafael Martins',
        carrier: 'Amazon',
        trackingCode: 'AMZ99887766',
        receivedAt: dateTime('2026-07-27T15:40'),
        deliveredAt: dateTime('2026-07-27T20:10'),
        pickedUpById: moradores[2].id,
        status: PackageStatus.delivered,
      },
    }),
    prisma.packageDelivery.create({
      data: {
        unitId: units[3].id,
        recipientName: 'Luciana Nogueira',
        carrier: 'Correios',
        trackingCode: 'BR123456789BR',
        receivedAt: dateTime('2026-07-29T09:12'),
        status: PackageStatus.received,
        notes: 'Envelope registrado.',
      },
    }),
  ]);

  await Promise.all([
    prisma.maintenanceOrder.create({
      data: {
        title: 'Reparo na bomba da piscina',
        description: 'Bomba apresenta ruido alto e queda de vazao.',
        category: 'Piscina',
        location: 'Casa de maquinas',
        vendor: 'AquaPrime Manutencoes',
        estimatedCost: 1850,
        scheduledAt: dateTime('2026-08-04T09:00'),
        status: MaintenanceStatus.scheduled,
        requesterId: admin.id,
      },
    }),
    prisma.maintenanceOrder.create({
      data: {
        title: 'Pintura de faixas da garagem',
        description: 'Renovacao da sinalizacao horizontal dos subsolos 1 e 2.',
        category: 'Garagem',
        location: 'Subsolos',
        vendor: 'Sinaliza SP',
        estimatedCost: 4300,
        status: MaintenanceStatus.quoted,
        requesterId: admin.id,
      },
    }),
    prisma.maintenanceOrder.create({
      data: {
        title: 'Troca de lampadas da escada do bloco C',
        description:
          'Chamado aberto por baixa iluminacao na rota de emergencia.',
        category: 'Eletrica',
        location: 'Bloco C',
        vendor: 'Equipe interna',
        estimatedCost: 140,
        scheduledAt: dateTime('2026-07-29T08:30'),
        completedAt: dateTime('2026-07-29T10:15'),
        status: MaintenanceStatus.completed,
        requesterId: limpeza.id,
      },
    }),
  ]);

  const assembly = await prisma.assembly.create({
    data: {
      title: 'Assembleia ordinaria - Agosto/2026',
      description:
        'Deliberacao sobre orcamento, portaria remota e obras de acessibilidade.',
      scheduledAt: dateTime('2026-08-12T19:30'),
      location: 'Salao de Festas',
      agenda:
        '1. Prestacao de contas; 2. Aprovacao de obras; 3. Portaria remota; 4. Assuntos gerais.',
      status: AssemblyStatus.scheduled,
      votes: {
        create: [
          {
            userId: moradores[0].id,
            option: 'favoravel',
            comment: 'Apoio a reforma da acessibilidade.',
          },
          {
            userId: moradores[1].id,
            option: 'abstencao',
            comment: 'Quero avaliar os orcamentos antes.',
          },
          {
            userId: moradores[2].id,
            option: 'favoravel',
            comment: 'Prioridade para seguranca e controle de acesso.',
          },
        ],
      },
    },
  });

  const conversation = await prisma.aiConversation.create({
    data: {
      userId: moradores[0].id,
      title: 'Duvidas sobre reserva do salao',
      context: { source: 'demo-seed', module: 'chatbot' },
      messages: {
        create: [
          {
            userId: moradores[0].id,
            role: 'user',
            content: 'Consigo levar buffet externo para o salao de festas?',
            metadata: { aiStatus: 'queued' },
          },
          {
            userId: admin.id,
            role: 'assistant',
            content:
              'Sim. O buffet deve ser cadastrado na portaria com antecedencia e seguir o horario reservado.',
            metadata: { aiStatus: 'answered_by_admin' },
          },
        ],
      },
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: admin.id,
        type: 'warning',
        title: 'Reserva aguardando aprovação',
        description:
          'Carlos Almeida solicitou o Salão de Festas para 02/08/2026.',
        module: 'Reservas',
        link: '/reservas',
        createdAt: dateTime('2026-07-29T16:20'),
      },
      {
        userId: admin.id,
        type: 'success',
        title: 'Pagamento confirmado',
        description: 'Pagamento de R$ 850,00 recebido de Fernanda Rocha.',
        module: 'Financeiro',
        link: '/financeiro',
        createdAt: dateTime('2026-07-29T14:10'),
      },
      {
        userId: admin.id,
        type: 'error',
        title: 'Novo chamado urgente',
        description:
          'Vazamento próximo ao elevador do bloco B requer acompanhamento.',
        module: 'Ocorrências',
        link: '/ocorrencias',
        createdAt: dateTime('2026-07-29T09:30'),
      },
      {
        userId: admin.id,
        type: 'info',
        title: 'Nova mensagem no chat',
        description:
          'Carlos Almeida enviou uma dúvida sobre o salão de festas.',
        module: 'Chatbot / IA',
        link: '/chatbot',
        createdAt: dateTime('2026-07-28T18:45'),
        readAt: dateTime('2026-07-29T08:00'),
      },
      {
        userId: moradores[0].id,
        type: 'success',
        title: 'Reserva aprovada',
        description: 'Sua reserva do Salão de Festas foi confirmada.',
        module: 'Reservas',
        link: '/reservas',
        createdAt: dateTime('2026-07-29T16:35'),
      },
      {
        userId: moradores[0].id,
        type: 'warning',
        title: 'Cobrança próxima do vencimento',
        description: 'A cobrança condominial vence nos próximos dias.',
        module: 'Financeiro',
        link: '/financeiro',
        createdAt: dateTime('2026-07-29T08:15'),
      },
      {
        userId: moradores[0].id,
        type: 'info',
        title: 'Nova resposta no chat',
        description:
          'A administração respondeu sua dúvida sobre buffet externo.',
        module: 'Chatbot / IA',
        link: '/chatbot',
        createdAt: dateTime('2026-07-28T19:00'),
        readAt: dateTime('2026-07-29T08:00'),
      },
      ...moradores.map((morador) => ({
        userId: morador.id,
        type: 'info',
        title: 'Novo comunicado',
        description:
          'Manutenção preventiva dos elevadores programada para esta semana.',
        module: 'Avisos',
        link: '/avisos',
        createdAt: dateTime('2026-07-28T10:00'),
      })),
    ],
  });

  await Promise.all([
    prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'seed',
        entity: 'database',
        metadata: {
          description: 'Base de demonstracao recriada para apresentacao',
        },
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'create',
        entity: 'assembly',
        entityId: assembly.id,
        metadata: { title: assembly.title },
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: moradores[0].id,
        action: 'create',
        entity: 'aiConversation',
        entityId: conversation.id,
        metadata: { title: conversation.title },
      },
    }),
  ]);

  console.log('Base de demonstracao recriada com sucesso.');
  console.table([
    { perfil: 'Admin', email: admin.email, senha: demoPassword },
    { perfil: 'Morador', email: moradores[0].email, senha: demoPassword },
    { perfil: 'Limpeza', email: limpeza.email, senha: demoPassword },
  ]);
  console.log('Resumo:', {
    users: await prisma.user.count(),
    units: await prisma.unit.count(),
    commonAreas: await prisma.commonArea.count(),
    reservations: await prisma.reservation.count(),
    payments: await prisma.payment.count(),
    announcements: await prisma.announcement.count(),
    occurrences: await prisma.occurrence.count(),
    notifications: await prisma.notification.count(),
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
