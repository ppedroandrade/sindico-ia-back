import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { JwtUser } from '../auth/user-request.interface';
import { NotificationsService } from '../notifications/notifications.service';

type EntityName =
  | 'audit'
  | 'units'
  | 'parking-spaces'
  | 'vehicles'
  | 'pets'
  | 'visitors'
  | 'packages'
  | 'maintenance'
  | 'assemblies';

@Injectable()
export class OperationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

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

  /**
   * Restringe os campos que um usuário não-admin pode enviar na criação de um recurso,
   * evitando que campos administrativos (status, custo, vínculo com outro usuário etc.)
   * sejam definidos diretamente pelo cliente (mass assignment).
   */
  private restrictToAllowedFields(
    data: Record<string, unknown>,
    allowedFields: string[],
    user: JwtUser,
  ) {
    if (user.role === 'admin') return data;
    const restricted: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in data) restricted[field] = data[field];
    }
    return restricted;
  }

  private log(
    user: JwtUser | undefined,
    action: string,
    entity: string,
    entityId?: string,
    metadata?: unknown,
  ) {
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
        return this.prisma.parkingSpace.findMany({
          include: { unit: true },
          orderBy: { code: 'asc' },
        });
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
      case 'maintenance':
        return this.prisma.maintenanceOrder.findMany({
          include: { requester: { select: this.safeUserSelect } },
          orderBy: { createdAt: 'desc' },
        });
      case 'assemblies':
        return this.prisma.assembly.findMany({
          include: {
            votes: { include: { user: { select: this.safeUserSelect } } },
          },
          orderBy: { scheduledAt: 'desc' },
        });
      default:
        throw new NotFoundException('Recurso não encontrado');
    }
  }

  async create(
    entity: EntityName,
    data: Record<string, unknown>,
    user: JwtUser,
  ) {
    switch (entity) {
      case 'units':
        this.assertAdmin(user);
        return this.createAndAudit(user, 'unit', () =>
          this.prisma.unit.create({
            data: this.clean(data) as any,
            include: {
              owner: { select: this.safeUserSelect },
              parkingSpaces: true,
            },
          }),
        );
      case 'parking-spaces':
        this.assertAdmin(user);
        return this.createAndAudit(user, 'parking-space', () =>
          this.prisma.parkingSpace.create({
            data: this.clean(data) as any,
            include: { unit: true },
          }),
        );
      case 'vehicles':
        return this.createAndAudit(user, 'vehicle', () =>
          this.prisma.vehicle.create({
            data: {
              ...this.clean(data),
              userId:
                user.role === 'admin' && data.userId
                  ? String(data.userId)
                  : user.userId,
            } as any,
            include: { user: { select: this.safeUserSelect } },
          }),
        );
      case 'pets':
        return this.createAndAudit(user, 'pet', () =>
          this.prisma.pet.create({
            data: {
              ...this.clean(data),
              userId:
                user.role === 'admin' && data.userId
                  ? String(data.userId)
                  : user.userId,
            } as any,
            include: { user: { select: this.safeUserSelect } },
          }),
        );
      case 'visitors': {
        const visitorData = this.restrictToAllowedFields(
          data,
          [
            'unitId',
            'residentId',
            'visitorName',
            'document',
            'phone',
            'purpose',
            'company',
            'expectedAt',
            'notes',
          ],
          user,
        );
        const visitor = await this.createAndAudit(user, 'visitor', () =>
          this.prisma.visitorAccess.create({
            data: {
              ...this.clean(visitorData),
              residentId:
                user.role === 'admin' && data.residentId
                  ? String(data.residentId)
                  : user.userId,
              expectedAt: data.expectedAt
                ? new Date(String(data.expectedAt))
                : undefined,
            } as any,
            include: { unit: true, resident: { select: this.safeUserSelect } },
          }),
        );
        await this.notifications.createForAdmins({
          type: 'info',
          title: 'Novo acesso autorizado',
          description: `${visitor.visitorName} foi cadastrado para a portaria.`,
          module: 'Portaria',
          link: '/portaria',
        });
        return visitor;
      }
      case 'packages': {
        this.assertAdmin(user);
        const packageDelivery = await this.createAndAudit(user, 'package', () =>
          this.prisma.packageDelivery.create({
            data: {
              ...this.clean(data),
              receivedAt: data.receivedAt
                ? new Date(String(data.receivedAt))
                : undefined,
            } as any,
            include: {
              unit: true,
              pickedUpBy: { select: this.safeUserSelect },
            },
          }),
        );
        if (packageDelivery.unitId) {
          await this.notifications.createForUnit(packageDelivery.unitId, {
            type: 'info',
            title: 'Nova encomenda na portaria',
            description: `Uma encomenda para ${packageDelivery.recipientName} foi recebida.`,
            module: 'Portaria',
            link: '/portaria',
          });
        }
        return packageDelivery;
      }
      case 'maintenance': {
        const maintenanceData = this.restrictToAllowedFields(
          data,
          [
            'title',
            'description',
            'category',
            'location',
            'requesterId',
            'scheduledAt',
          ],
          user,
        );
        const maintenance = await this.createAndAudit(user, 'maintenance', () =>
          this.prisma.maintenanceOrder.create({
            data: {
              ...this.clean(maintenanceData),
              requesterId:
                user.role === 'admin' && data.requesterId
                  ? String(data.requesterId)
                  : user.userId,
              scheduledAt: data.scheduledAt
                ? new Date(String(data.scheduledAt))
                : undefined,
            } as any,
            include: { requester: { select: this.safeUserSelect } },
          }),
        );
        await Promise.all([
          this.notifications.createForAdmins({
            type: 'warning',
            title: 'Nova solicitação de manutenção',
            description: maintenance.title,
            module: 'Manutenção',
            link: '/manutencao',
          }),
          maintenance.requesterId
            ? this.notifications.createForUser(maintenance.requesterId, {
                type: 'info',
                title: 'Solicitação de manutenção criada',
                description: maintenance.title,
                module: 'Manutenção',
                link: '/manutencao',
              })
            : Promise.resolve({ count: 0 }),
        ]);
        return maintenance;
      }
      case 'assemblies': {
        this.assertAdmin(user);
        const assembly = await this.createAndAudit(user, 'assembly', () =>
          this.prisma.assembly.create({
            data: {
              ...this.clean(data),
              scheduledAt: new Date(String(data.scheduledAt)),
            } as any,
            include: { votes: true },
          }),
        );
        await this.notifications.createForResidents({
          type: 'info',
          title: 'Nova assembleia agendada',
          description: `${assembly.title} em ${assembly.scheduledAt.toLocaleString('pt-BR')}.`,
          module: 'Assembleias',
          link: '/assembleias',
        });
        return assembly;
      }
      default:
        throw new NotFoundException('Recurso não encontrado');
    }
  }

  async update(
    entity: EntityName,
    id: string,
    data: Record<string, unknown>,
    user: JwtUser,
  ) {
    if (entity !== 'vehicles' && entity !== 'pets' && entity !== 'visitors')
      this.assertAdmin(user);

    switch (entity) {
      case 'units':
        return this.updateAndAudit(
          user,
          'unit',
          id,
          () =>
            this.prisma.unit.update({
              where: { id },
              data: this.clean(data) as any,
              include: {
                owner: { select: this.safeUserSelect },
                parkingSpaces: true,
              },
            }),
          data,
        );
      case 'parking-spaces':
        return this.updateAndAudit(
          user,
          'parking-space',
          id,
          () =>
            this.prisma.parkingSpace.update({
              where: { id },
              data: this.clean(data) as any,
              include: { unit: true },
            }),
          data,
        );
      case 'vehicles':
        await this.ensureOwnVehicle(id, user);
        return this.updateAndAudit(
          user,
          'vehicle',
          id,
          () =>
            this.prisma.vehicle.update({
              where: { id },
              data: this.clean(data) as any,
              include: { user: { select: this.safeUserSelect } },
            }),
          data,
        );
      case 'pets':
        await this.ensureOwnPet(id, user);
        return this.updateAndAudit(
          user,
          'pet',
          id,
          () =>
            this.prisma.pet.update({
              where: { id },
              data: this.clean(data) as any,
              include: { user: { select: this.safeUserSelect } },
            }),
          data,
        );
      case 'visitors': {
        await this.ensureOwnVisitor(id, user);
        const visitorData = this.restrictToAllowedFields(
          data,
          [
            'unitId',
            'visitorName',
            'document',
            'phone',
            'purpose',
            'company',
            'expectedAt',
            'notes',
          ],
          user,
        );
        return this.updateAndAudit(
          user,
          'visitor',
          id,
          () =>
            this.prisma.visitorAccess.update({
              where: { id },
              data: {
                ...this.clean(visitorData),
                expectedAt: data.expectedAt
                  ? new Date(String(data.expectedAt))
                  : undefined,
              } as any,
              include: {
                unit: true,
                resident: { select: this.safeUserSelect },
              },
            }),
          data,
        );
      }
      case 'packages': {
        const packageDelivery = await this.updateAndAudit(
          user,
          'package',
          id,
          () =>
            this.prisma.packageDelivery.update({
              where: { id },
              data: {
                ...this.clean(data),
                deliveredAt:
                  data.status === 'delivered'
                    ? new Date()
                    : data.deliveredAt
                      ? new Date(String(data.deliveredAt))
                      : undefined,
              } as any,
              include: {
                unit: true,
                pickedUpBy: { select: this.safeUserSelect },
              },
            }),
          data,
        );
        if (packageDelivery.unitId && data.status) {
          await this.notifications.createForUnit(packageDelivery.unitId, {
            type: data.status === 'delivered' ? 'success' : 'info',
            title: 'Encomenda atualizada',
            description: `A encomenda para ${packageDelivery.recipientName} está com status ${String(data.status)}.`,
            module: 'Portaria',
            link: '/portaria',
          });
        }
        return packageDelivery;
      }
      case 'maintenance': {
        const maintenance = await this.updateAndAudit(
          user,
          'maintenance',
          id,
          () =>
            this.prisma.maintenanceOrder.update({
              where: { id },
              data: {
                ...this.clean(data),
                scheduledAt: data.scheduledAt
                  ? new Date(String(data.scheduledAt))
                  : undefined,
                completedAt:
                  data.status === 'completed'
                    ? new Date()
                    : data.completedAt
                      ? new Date(String(data.completedAt))
                      : undefined,
              } as any,
              include: { requester: { select: this.safeUserSelect } },
            }),
          data,
        );
        if (maintenance.requesterId) {
          await this.notifications.createForUser(maintenance.requesterId, {
            type: data.status === 'completed' ? 'success' : 'info',
            title: 'Manutenção atualizada',
            description: `${maintenance.title}: ${maintenance.status}.`,
            module: 'Manutenção',
            link: '/manutencao',
          });
        }
        return maintenance;
      }
      case 'assemblies': {
        const assembly = await this.updateAndAudit(
          user,
          'assembly',
          id,
          () =>
            this.prisma.assembly.update({
              where: { id },
              data: {
                ...this.clean(data),
                scheduledAt: data.scheduledAt
                  ? new Date(String(data.scheduledAt))
                  : undefined,
              } as any,
              include: {
                votes: { include: { user: { select: this.safeUserSelect } } },
              },
            }),
          data,
        );
        await this.notifications.createForResidents({
          type: 'info',
          title: 'Assembleia atualizada',
          description: assembly.title,
          module: 'Assembleias',
          link: '/assembleias',
        });
        return assembly;
      }
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
      maintenance: this.prisma.maintenanceOrder,
      assemblies: this.prisma.assembly,
    };
    if (!delegates[entity])
      throw new BadRequestException('Recurso não pode ser removido');
    let removed;
    try {
      removed = await delegates[entity].delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'Não é possível excluir este item pois existem registros vinculados a ele.',
        );
      }
      throw error;
    }
    await this.log(user, 'delete', entity, id);
    return removed;
  }

  async updateVisitorStatus(
    id: string,
    status: 'checked_in' | 'checked_out' | 'cancelled',
    user: JwtUser,
  ) {
    this.assertAdmin(user);
    const data =
      status === 'checked_in'
        ? { status, checkedInAt: new Date() }
        : status === 'checked_out'
          ? { status, checkedOutAt: new Date() }
          : { status };
    const visitor = await this.updateAndAudit(
      user,
      'visitor',
      id,
      () =>
        this.prisma.visitorAccess.update({
          where: { id },
          data,
          include: { unit: true, resident: { select: this.safeUserSelect } },
        }),
      data,
    );
    if (visitor.residentId) {
      const statusLabel =
        status === 'checked_in'
          ? 'entrou no condomínio'
          : status === 'checked_out'
            ? 'saiu do condomínio'
            : 'teve o acesso cancelado';
      await this.notifications.createForUser(visitor.residentId, {
        type: status === 'cancelled' ? 'warning' : 'info',
        title: 'Acesso de visitante atualizado',
        description: `${visitor.visitorName} ${statusLabel}.`,
        module: 'Portaria',
        link: '/portaria',
      });
    }
    return visitor;
  }

  async addResident(
    unitId: string,
    data: Record<string, unknown>,
    user: JwtUser,
  ) {
    this.assertAdmin(user);
    if (!data.userId) throw new BadRequestException('Informe o usuário');
    return this.prisma.unitResident.create({
      data: {
        unitId,
        userId: String(data.userId),
        type: data.type ? (String(data.type) as any) : 'resident',
        isPrimary: Boolean(data.isPrimary),
      },
      include: { user: { select: this.safeUserSelect }, unit: true },
    });
  }

  removeResident(id: string, user: JwtUser) {
    this.assertAdmin(user);
    return this.prisma.unitResident.delete({ where: { id } });
  }

  async voteAssembly(
    assemblyId: string,
    data: Record<string, unknown>,
    user: JwtUser,
  ) {
    if (!data.option) throw new BadRequestException('Informe o voto');
    const vote = await this.prisma.assemblyVote.upsert({
      where: { assemblyId_userId: { assemblyId, userId: user.userId } },
      update: {
        option: String(data.option),
        comment: data.comment ? String(data.comment) : undefined,
      },
      create: {
        assemblyId,
        userId: user.userId,
        option: String(data.option),
        comment: data.comment ? String(data.comment) : undefined,
      },
      include: { user: { select: this.safeUserSelect } },
    });
    await this.log(user, 'vote', 'assembly', assemblyId, {
      option: data.option,
    });
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

  async addOccurrenceComment(
    occurrenceId: string,
    data: Record<string, unknown>,
    user: JwtUser,
  ) {
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
    const occurrence = await this.prisma.occurrence.findUnique({
      where: { id: occurrenceId },
    });
    if (occurrence) {
      if (user.role === 'admin') {
        await this.notifications.createForUser(occurrence.reporterId, {
          type: 'info',
          title: 'Nova resposta à sua solicitação',
          description: occurrence.title,
          module: 'Ocorrências',
          link: '/ocorrencias',
        });
      } else {
        await this.notifications.createForAdmins({
          type: 'info',
          title: 'Nova mensagem em um chamado',
          description: occurrence.title,
          module: 'Ocorrências',
          link: '/ocorrencias',
        });
      }
    }
    return comment;
  }

  private async createAndAudit<T extends { id?: string }>(
    user: JwtUser,
    entity: string,
    action: () => Promise<T>,
  ) {
    const result = await action();
    await this.log(user, 'create', entity, result.id);
    return result;
  }

  private async updateAndAudit<T>(
    user: JwtUser,
    entity: string,
    id: string,
    action: () => Promise<T>,
    metadata?: unknown,
  ) {
    const result = await action();
    await this.log(user, 'update', entity, id, metadata);
    return result;
  }

  private async ensureOccurrenceAccess(id: string, user: JwtUser) {
    const occurrence = await this.prisma.occurrence.findUnique({
      where: { id },
    });
    if (!occurrence) throw new NotFoundException('Ocorrência não encontrada');
    if (user.role !== 'admin' && occurrence.reporterId !== user.userId)
      throw new ForbiddenException('Acesso negado');
  }

  private async ensureOwnVehicle(id: string, user: JwtUser) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException('Veículo não encontrado');
    if (user.role !== 'admin' && vehicle.userId !== user.userId)
      throw new ForbiddenException('Acesso negado');
  }

  private async ensureOwnPet(id: string, user: JwtUser) {
    const pet = await this.prisma.pet.findUnique({ where: { id } });
    if (!pet) throw new NotFoundException('Pet não encontrado');
    if (user.role !== 'admin' && pet.userId !== user.userId)
      throw new ForbiddenException('Acesso negado');
  }

  private async ensureOwnVisitor(id: string, user: JwtUser) {
    const visitor = await this.prisma.visitorAccess.findUnique({
      where: { id },
    });
    if (!visitor) throw new NotFoundException('Visitante não encontrado');
    if (user.role !== 'admin' && visitor.residentId !== user.userId)
      throw new ForbiddenException('Acesso negado');
  }

  private clean(data: Record<string, unknown>) {
    return Object.fromEntries(
      Object.entries(data).filter(
        ([, value]) => value !== undefined && value !== null && value !== '',
      ),
    );
  }
}
