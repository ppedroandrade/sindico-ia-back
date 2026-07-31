import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { filter, map, Subject } from 'rxjs';
import { JwtUser } from '../auth/user-request.interface';
import { PrismaService } from '../prisma.service';

export type NotificationKind = 'info' | 'success' | 'warning' | 'error';

export interface NotificationPayload {
  type?: NotificationKind;
  title: string;
  description: string;
  module: string;
  link?: string;
  key?: string;
}

@Injectable()
export class NotificationsService {
  private readonly updates = new Subject<string>();

  constructor(private readonly prisma: PrismaService) {}

  async findAll(user: JwtUser) {
    await this.syncPaymentAlerts(user);

    const [notifications, unreadCount] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.notification.count({
        where: { userId: user.userId, readAt: null },
      }),
    ]);

    return { notifications, unreadCount };
  }

  async markRead(id: string, user: JwtUser) {
    const result = await this.prisma.notification.updateMany({
      where: { id, userId: user.userId },
      data: { readAt: new Date() },
    });
    if (result.count === 0)
      throw new NotFoundException('Notificação não encontrada');
    return this.prisma.notification.findUnique({ where: { id } });
  }

  async markAllRead(user: JwtUser) {
    await this.prisma.notification.updateMany({
      where: { userId: user.userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { success: true };
  }

  stream(user: JwtUser) {
    return this.updates.pipe(
      filter((userId) => userId === user.userId),
      map(() => ({ data: { refresh: true } })),
    );
  }

  createForUser(userId: string, payload: NotificationPayload) {
    return this.createForUsers([userId], payload);
  }

  async createForRole(role: Role, payload: NotificationPayload) {
    const users = await this.prisma.user.findMany({
      where: { role, active: true },
      select: { id: true },
    });
    return this.createForUsers(
      users.map((user) => user.id),
      payload,
    );
  }

  createForAdmins(payload: NotificationPayload) {
    return this.createForRole(Role.admin, payload);
  }

  createForResidents(payload: NotificationPayload) {
    return this.createForRole(Role.morador, payload);
  }

  async createForUnit(unitId: string, payload: NotificationPayload) {
    const unit = await this.prisma.unit.findUnique({
      where: { id: unitId },
      select: {
        ownerId: true,
        residents: { select: { userId: true } },
      },
    });
    if (!unit) return { count: 0 };

    return this.createForUsers(
      [
        unit.ownerId,
        ...unit.residents.map((resident) => resident.userId),
      ].filter((id): id is string => Boolean(id)),
      payload,
    );
  }

  async createForUsers(userIds: string[], payload: NotificationPayload) {
    const uniqueUserIds = [...new Set(userIds.filter(Boolean))];
    if (uniqueUserIds.length === 0) return { count: 0 };

    const result = await this.prisma.notification.createMany({
      data: uniqueUserIds.map((userId) => ({
        userId,
        key: payload.key,
        type: payload.type ?? 'info',
        title: payload.title,
        description: payload.description,
        module: payload.module,
        link: payload.link,
      })),
      skipDuplicates: true,
    });
    if (result.count > 0) {
      uniqueUserIds.forEach((userId) => this.updates.next(userId));
    }
    return result;
  }

  private async syncPaymentAlerts(user: JwtUser) {
    const now = new Date();
    const upcomingLimit = new Date(now);
    upcomingLimit.setDate(upcomingLimit.getDate() + 3);

    const where: Prisma.PaymentWhereInput = {
      status: { not: 'paid' },
      ...(user.role === Role.morador ? { userId: user.userId } : {}),
    };
    const payments = await this.prisma.payment.findMany({
      where,
      select: { id: true, userId: true, amount: true, dueDate: true },
    });

    const adminIds =
      user.role === Role.admin
        ? (
            await this.prisma.user.findMany({
              where: { role: Role.admin, active: true },
              select: { id: true },
            })
          ).map((admin) => admin.id)
        : [];

    for (const payment of payments) {
      const overdue = payment.dueDate < now;
      const dueSoon = !overdue && payment.dueDate <= upcomingLimit;
      if (!overdue && !dueSoon) continue;

      const amount = payment.amount.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
      const dueDate = payment.dueDate.toLocaleDateString('pt-BR');
      const payload: NotificationPayload = overdue
        ? {
            type: 'error',
            title: 'Cobrança vencida',
            description: `${amount} venceu em ${dueDate}.`,
            module: 'Financeiro',
            link: '/financeiro',
            key: `payment-overdue:${payment.id}`,
          }
        : {
            type: 'warning',
            title: 'Cobrança próxima do vencimento',
            description: `${amount} vence em ${dueDate}.`,
            module: 'Financeiro',
            link: '/financeiro',
            key: `payment-due-soon:${payment.id}`,
          };

      const recipients = user.role === Role.admin ? adminIds : [payment.userId];
      await this.createForUsers(recipients, payload);
    }
  }
}
