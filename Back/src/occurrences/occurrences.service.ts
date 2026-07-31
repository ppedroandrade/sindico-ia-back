import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { JwtUser } from '../auth/user-request.interface';
import { CreateOccurrenceDto } from './dto/create-occurrence.dto';
import { UpdateOccurrenceDto } from './dto/update-occurrence.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OccurrencesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  private readonly includeUsers = {
    reporter: {
      select: {
        id: true,
        name: true,
        email: true,
        apartment: true,
        parkingSpaces: true,
      },
    },
    assignee: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  };

  async create(data: CreateOccurrenceDto, user: JwtUser) {
    const occurrence = await this.prisma.occurrence.create({
      data: {
        ...data,
        reporterId: user.userId,
      },
      include: this.includeUsers,
    });
    await Promise.all([
      this.notifications.createForUser(occurrence.reporterId, {
        type: 'info',
        title: 'Solicitação registrada',
        description: `O chamado “${occurrence.title}” foi recebido.`,
        module: 'Ocorrências',
        link: '/ocorrencias',
      }),
      this.notifications.createForAdmins({
        type: occurrence.priority === 'urgent' ? 'error' : 'warning',
        title: 'Novo chamado administrativo',
        description: `${occurrence.reporter.name} registrou “${occurrence.title}”.`,
        module: 'Ocorrências',
        link: '/ocorrencias',
      }),
    ]);
    return occurrence;
  }

  findAll(user: JwtUser) {
    const where: Prisma.OccurrenceWhereInput =
      user.role === Role.admin ? {} : { reporterId: user.userId };
    return this.prisma.occurrence.findMany({
      where,
      include: this.includeUsers,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: JwtUser) {
    const occurrence = await this.prisma.occurrence.findUnique({
      where: { id },
      include: this.includeUsers,
    });
    if (!occurrence) throw new NotFoundException('Ocorrência não encontrada');
    if (user.role !== Role.admin && occurrence.reporterId !== user.userId) {
      throw new ForbiddenException('Acesso negado');
    }
    return occurrence;
  }

  async update(id: string, data: UpdateOccurrenceDto) {
    const occurrence = await this.prisma.occurrence.findUnique({
      where: { id },
    });
    if (!occurrence) throw new NotFoundException('Ocorrência não encontrada');
    const updated = await this.prisma.occurrence.update({
      where: { id },
      data,
      include: this.includeUsers,
    });
    const statusChanged = data.status && data.status !== occurrence.status;
    if (statusChanged || data.assigneeId) {
      const statusLabels = {
        open: 'aberto',
        in_progress: 'em andamento',
        resolved: 'resolvido',
        cancelled: 'cancelado',
      } as const;
      await Promise.all([
        this.notifications.createForUser(updated.reporterId, {
          type:
            updated.status === 'resolved'
              ? 'success'
              : updated.status === 'cancelled'
                ? 'error'
                : 'info',
          title: 'Solicitação atualizada',
          description: `“${updated.title}” está ${statusLabels[updated.status]}.`,
          module: 'Ocorrências',
          link: '/ocorrencias',
        }),
        this.notifications.createForAdmins({
          type: 'info',
          title: 'Chamado atualizado',
          description: `“${updated.title}” está ${statusLabels[updated.status]}.`,
          module: 'Ocorrências',
          link: '/ocorrencias',
        }),
      ]);
    }
    return updated;
  }
}
