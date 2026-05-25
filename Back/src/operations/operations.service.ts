import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtUser } from '../auth/user-request.interface';

type EntityName =
  | 'audit'
  | 'units'
  | 'parking-spaces'
  | 'vehicles'
  | 'pets'
  | 'visitors'
  | 'packages'
  | 'documents'
  | 'maintenance'
  | 'assemblies';

@Injectable()
export class OperationsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly safeUserSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    apartment: true,
    parkingSpaces: true,
    active: true,
  };

  private assertAdmin(user: JwtUser) {
    if (user.role !== 'admin') throw new ForbiddenException('Acesso negado');
  }

  private log(user: JwtUser | undefined, action: string, entity: string, entityId?: string, metadata?: unknown) {
    return this.prisma.auditLog.create({
      data: {
        userId: user?.userId,
        action,
        entity,
        entityId,
        metadata: metadata as any,
      },
    });
  }

  getSettings() {
    return this.prisma.condominiumSettings.upsert({
      where: { id: 'main' },
      update: {},
      create: { id: 'main' },
    });
  }

  async updateSettings(data: Record<string, unknown>, user: JwtUser) {
    this.assertAdmin(user);
    const settings = await this.prisma.condominiumSettings.upsert({
      where: { id: 'main' },
      update: this.clean(data),
      create: { id: 'main', ...this.clean(data) },
    });
    await this.log(user, 'update', 'settings', settings.id, data);
    return settings;
  }

  async list(entity: EntityName, user: JwtUser) {
    switch (entity) {
      case 'audit':
        this.assertAdmin(user);
        return this.prisma.auditLog.findMany({
          take: 200,
          include: { user: { select: this.safeUserSelect } },
          orderBy: { createdAt: 'desc' },
        });
      case 'units':
        this.assertAdmin(user);
        return this.prisma.unit.findMany({
          include: {
            owner: { select: this.safeUserSelect },
            residents: { include: { user: { select: this.safeUserSelect } } },
            parkingSpaces: true,
          },
          orderBy: [{ block: 'asc' }, { number: 'asc' }],
        });
      case 'parking-spaces':
        this.assertAdmin(user);
        return this.prisma.parkingSpace.findMany({ include: { unit: true }, orderBy: { code: 'asc' } });
      case 'vehicles':
        return this.prisma.vehicle.findMany({
          where: user.role === 'admin' ? {} : { userId: user.userId },
          include: { user: { select: this.safeUserSelect } },
          orderBy: { createdAt: 'desc' },
        });
      case 'pets':
        return this.prisma.pet.findMany({
          where: user.role === 'admin' ? {} : { userId: user.userId },
          include: { user: { select: this.safeUserSelect } },
          orderBy: { createdAt: 'desc' },
        });
      case 'visitors':
        return this.prisma.visitorAccess.findMany({
          where: user.role === 'admin' ? {} : { residentId: user.userId },
          include: { unit: true, resident: { select: this.safeUserSelect } },
          orderBy: { createdAt: 'desc' },
        });
      case 'packages':
        return this.prisma.packageDelivery.findMany({
          include: { unit: true, pickedUpBy: { select: this.safeUserSelect } },
          orderBy: { createdAt: 'desc' },
        });
      case 'documents':
        return this.prisma.document.findMany({
          where: user.role === 'admin' ? {} : { visibleToResidents: true },
          orderBy: { createdAt: 'desc' },
        });
      case 'maintenance':
        return this.prisma.maintenanceOrder.findMany({
          include: { requester: { select: this.safeUserSelect } },
          orderBy: { createdAt: 'desc' },
        });
      case 'assemblies':
        return this.prisma.assembly.findMany({
          include: { votes: { include: { user: { select: this.safeUserSelect } } } },
          orderBy: { scheduledAt: 'desc' },
        });
      default:
        throw new NotFoundException('Recurso não encontrado');
    }
  }

  async create(entity: EntityName, data: Record<string, unknown>, user: JwtUser) {
    switch (entity) {
      case 'units':
        this.assertAdmin(user);
        return this.createAndAudit(user, 'unit', () =>
          this.prisma.unit.create({ data: this.clean(data) as any, include: { owner: { select: this.safeUserSelect }, parkingSpaces: true } }),
        );
      case 'parking-spaces':
        this.assertAdmin(user);
        return this.createAndAudit(user, 'parking-space', () =>
          this.prisma.parkingSpace.create({ data: this.clean(data) as any, include: { unit: true } }),
        );
      case 'vehicles':
        return this.createAndAudit(user, 'vehicle', () => this.prisma.vehicle.create({
          data: { ...this.clean(data), userId: user.role === 'admin' && data.userId ? String(data.userId) : user.userId } as any,
          include: { user: { select: this.safeUserSelect } },
        }));
      case 'pets':
        return this.createAndAudit(user, 'pet', () => this.prisma.pet.create({
          data: { ...this.clean(data), userId: user.role === 'admin' && data.userId ? String(data.userId) : user.userId } as any,
          include: { user: { select: this.safeUserSelect } },
        }));
      case 'visitors':
        return this.createAndAudit(user, 'visitor', () => this.prisma.visitorAccess.create({
          data: {
            ...this.clean(data),
            residentId: user.role === 'admin' && data.residentId ? String(data.residentId) : user.userId,
            expectedAt: data.expectedAt ? new Date(String(data.expectedAt)) : undefined,
          } as any,
          include: { unit: true, resident: { select: this.safeUserSelect } },
        }));
      case 'packages':
        this.assertAdmin(user);
        return this.createAndAudit(user, 'package', () => this.prisma.packageDelivery.create({
          data: { ...this.clean(data), receivedAt: data.receivedAt ? new Date(String(data.receivedAt)) : undefined } as any,
          include: { unit: true, pickedUpBy: { select: this.safeUserSelect } },
        }));
      case 'documents':
        this.assertAdmin(user);
        return this.createAndAudit(user, 'document', () => this.prisma.document.create({ data: this.clean(data) as any }));
      case 'maintenance':
        return this.createAndAudit(user, 'maintenance', () => this.prisma.maintenanceOrder.create({
          data: {
            ...this.clean(data),
            requesterId: user.role === 'admin' && data.requesterId ? String(data.requesterId) : user.userId,
            scheduledAt: data.scheduledAt ? new Date(String(data.scheduledAt)) : undefined,
          } as any,
          include: { requester: { select: this.safeUserSelect } },
        }));
      case 'assemblies':
        this.assertAdmin(user);
        return this.createAndAudit(user, 'assembly', () => this.prisma.assembly.create({
          data: { ...this.clean(data), scheduledAt: new Date(String(data.scheduledAt)) } as any,
          include: { votes: true },
        }));
      default:
        throw new NotFoundException('Recurso não encontrado');
    }
  }

  async update(entity: EntityName, id: string, data: Record<string, unknown>, user: JwtUser) {
    if (entity !== 'vehicles' && entity !== 'pets' && entity !== 'visitors') this.assertAdmin(user);

    switch (entity) {
      case 'units':
        return this.updateAndAudit(user, 'unit', id, () => this.prisma.unit.update({ where: { id }, data: this.clean(data) as any, include: { owner: { select: this.safeUserSelect }, parkingSpaces: true } }), data);
      case 'parking-spaces':
        return this.updateAndAudit(user, 'parking-space', id, () => this.prisma.parkingSpace.update({ where: { id }, data: this.clean(data) as any, include: { unit: true } }), data);
      case 'vehicles':
        await this.ensureOwnVehicle(id, user);
        return this.updateAndAudit(user, 'vehicle', id, () => this.prisma.vehicle.update({ where: { id }, data: this.clean(data) as any, include: { user: { select: this.safeUserSelect } } }), data);
      case 'pets':
        await this.ensureOwnPet(id, user);
        return this.updateAndAudit(user, 'pet', id, () => this.prisma.pet.update({ where: { id }, data: this.clean(data) as any, include: { user: { select: this.safeUserSelect } } }), data);
      case 'visitors':
        await this.ensureOwnVisitor(id, user);
        return this.updateAndAudit(user, 'visitor', id, () => this.prisma.visitorAccess.update({
          where: { id },
          data: { ...this.clean(data), expectedAt: data.expectedAt ? new Date(String(data.expectedAt)) : undefined } as any,
          include: { unit: true, resident: { select: this.safeUserSelect } },
        }), data);
      case 'packages':
        return this.updateAndAudit(user, 'package', id, () => this.prisma.packageDelivery.update({
          where: { id },
          data: {
            ...this.clean(data),
            deliveredAt: data.status === 'delivered' ? new Date() : data.deliveredAt ? new Date(String(data.deliveredAt)) : undefined,
          } as any,
          include: { unit: true, pickedUpBy: { select: this.safeUserSelect } },
        }), data);
      case 'documents':
        return this.updateAndAudit(user, 'document', id, () => this.prisma.document.update({ where: { id }, data: this.clean(data) as any }), data);
      case 'maintenance':
        return this.updateAndAudit(user, 'maintenance', id, () => this.prisma.maintenanceOrder.update({
          where: { id },
          data: {
            ...this.clean(data),
            scheduledAt: data.scheduledAt ? new Date(String(data.scheduledAt)) : undefined,
            completedAt: data.status === 'completed' ? new Date() : data.completedAt ? new Date(String(data.completedAt)) : undefined,
          } as any,
          include: { requester: { select: this.safeUserSelect } },
        }), data);
      case 'assemblies':
        return this.updateAndAudit(user, 'assembly', id, () => this.prisma.assembly.update({
          where: { id },
          data: { ...this.clean(data), scheduledAt: data.scheduledAt ? new Date(String(data.scheduledAt)) : undefined } as any,
          include: { votes: { include: { user: { select: this.safeUserSelect } } } },
        }), data);
      default:
        throw new NotFoundException('Recurso não encontrado');
    }
  }

  async remove(entity: EntityName, id: string, user: JwtUser) {
    this.assertAdmin(user);
    const delegates: Partial<Record<EntityName, any>> = {
      units: this.prisma.unit,
      'parking-spaces': this.prisma.parkingSpace,
      vehicles: this.prisma.vehicle,
      pets: this.prisma.pet,
      visitors: this.prisma.visitorAccess,
      packages: this.prisma.packageDelivery,
      documents: this.prisma.document,
      maintenance: this.prisma.maintenanceOrder,
      assemblies: this.prisma.assembly,
    };
    if (!delegates[entity]) throw new BadRequestException('Recurso não pode ser removido');
    const removed = await delegates[entity].delete({ where: { id } });
    await this.log(user, 'delete', entity, id);
    return removed;
  }

  async updateVisitorStatus(id: string, status: 'checked_in' | 'checked_out' | 'cancelled', user: JwtUser) {
    this.assertAdmin(user);
    const data =
      status === 'checked_in'
        ? { status, checkedInAt: new Date() }
        : status === 'checked_out'
          ? { status, checkedOutAt: new Date() }
          : { status };
    return this.updateAndAudit(user, 'visitor', id, () =>
      this.prisma.visitorAccess.update({
        where: { id },
        data,
        include: { unit: true, resident: { select: this.safeUserSelect } },
      }), data);
  }

  async uploadDocumentFile(file: any, user: JwtUser) {
    this.assertAdmin(user);
    if (!file) throw new BadRequestException('Arquivo não enviado');
    await this.log(user, 'upload', 'document-file', file.filename, { originalName: file.originalname });
    return {
      fileUrl: `/operations/documents/files/${file.filename}`,
      originalName: file.originalname,
      filename: file.filename,
    };
  }

  async addResident(unitId: string, data: Record<string, unknown>, user: JwtUser) {
    this.assertAdmin(user);
    if (!data.userId) throw new BadRequestException('Informe o usuário');
    return this.prisma.unitResident.create({
      data: {
        unitId,
        userId: String(data.userId),
        type: data.type ? String(data.type) as any : 'resident',
        isPrimary: Boolean(data.isPrimary),
      },
      include: { user: { select: this.safeUserSelect }, unit: true },
    });
  }

  removeResident(id: string, user: JwtUser) {
    this.assertAdmin(user);
    return this.prisma.unitResident.delete({ where: { id } });
  }

  async voteAssembly(assemblyId: string, data: Record<string, unknown>, user: JwtUser) {
    if (!data.option) throw new BadRequestException('Informe o voto');
    const vote = await this.prisma.assemblyVote.upsert({
      where: { assemblyId_userId: { assemblyId, userId: user.userId } },
      update: { option: String(data.option), comment: data.comment ? String(data.comment) : undefined },
      create: {
        assemblyId,
        userId: user.userId,
        option: String(data.option),
        comment: data.comment ? String(data.comment) : undefined,
      },
      include: { user: { select: this.safeUserSelect } },
    });
    await this.log(user, 'vote', 'assembly', assemblyId, { option: data.option });
    return vote;
  }

  async listOccurrenceComments(occurrenceId: string, user: JwtUser) {
    await this.ensureOccurrenceAccess(occurrenceId, user);
    return this.prisma.occurrenceComment.findMany({
      where: { occurrenceId },
      include: { author: { select: this.safeUserSelect } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addOccurrenceComment(occurrenceId: string, data: Record<string, unknown>, user: JwtUser) {
    if (!data.content) throw new BadRequestException('Informe o comentário');
    await this.ensureOccurrenceAccess(occurrenceId, user);
    const comment = await this.prisma.occurrenceComment.create({
      data: {
        occurrenceId,
        authorId: user.userId,
        content: String(data.content),
      },
      include: { author: { select: this.safeUserSelect } },
    });
    await this.log(user, 'comment', 'occurrence', occurrenceId);
    return comment;
  }

  private async createAndAudit<T extends { id?: string }>(user: JwtUser, entity: string, action: () => Promise<T>) {
    const result = await action();
    await this.log(user, 'create', entity, result.id);
    return result;
  }

  private async updateAndAudit<T>(user: JwtUser, entity: string, id: string, action: () => Promise<T>, metadata?: unknown) {
    const result = await action();
    await this.log(user, 'update', entity, id, metadata);
    return result;
  }

  private async ensureOccurrenceAccess(id: string, user: JwtUser) {
    const occurrence = await this.prisma.occurrence.findUnique({ where: { id } });
    if (!occurrence) throw new NotFoundException('Ocorrência não encontrada');
    if (user.role !== 'admin' && occurrence.reporterId !== user.userId) throw new ForbiddenException('Acesso negado');
  }

  private async ensureOwnVehicle(id: string, user: JwtUser) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException('Veículo não encontrado');
    if (user.role !== 'admin' && vehicle.userId !== user.userId) throw new ForbiddenException('Acesso negado');
  }

  private async ensureOwnPet(id: string, user: JwtUser) {
    const pet = await this.prisma.pet.findUnique({ where: { id } });
    if (!pet) throw new NotFoundException('Pet não encontrado');
    if (user.role !== 'admin' && pet.userId !== user.userId) throw new ForbiddenException('Acesso negado');
  }

  private async ensureOwnVisitor(id: string, user: JwtUser) {
    const visitor = await this.prisma.visitorAccess.findUnique({ where: { id } });
    if (!visitor) throw new NotFoundException('Visitante não encontrado');
    if (user.role !== 'admin' && visitor.residentId !== user.userId) throw new ForbiddenException('Acesso negado');
  }

  private clean(data: Record<string, unknown>) {
    return Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined && value !== null && value !== ''),
    );
  }
}
