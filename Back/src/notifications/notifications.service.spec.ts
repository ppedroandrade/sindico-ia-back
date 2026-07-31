import { NotFoundException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  const user = {
    userId: 'resident-1',
    email: 'resident@example.com',
    role: 'morador' as const,
  };

  it('marks only notifications owned by the authenticated user as read', async () => {
    const prisma = {
      notification: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 'notification-1', userId: user.userId }),
      },
    };
    const service = new NotificationsService(prisma as any);

    await service.markRead('notification-1', user);

    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { id: 'notification-1', userId: user.userId },
      data: { readAt: expect.any(Date) },
    });
  });

  it('rejects access to a notification from another user', async () => {
    const prisma = {
      notification: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    const service = new NotificationsService(prisma as any);

    await expect(
      service.markRead('another-notification', user),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deduplicates recipients when creating notifications', async () => {
    const prisma = {
      notification: {
        createMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    };
    const service = new NotificationsService(prisma as any);

    await service.createForUsers(['resident-1', 'resident-1', 'resident-2'], {
      title: 'Novo aviso',
      description: 'Comunicado de teste',
      module: 'Avisos',
    });

    expect(prisma.notification.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ userId: 'resident-1' }),
          expect.objectContaining({ userId: 'resident-2' }),
        ]),
      }),
    );
    expect(prisma.notification.createMany.mock.calls[0][0].data).toHaveLength(
      2,
    );
  });

  it('emits a real-time event for the notification recipient', async () => {
    const prisma = {
      notification: {
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const service = new NotificationsService(prisma as any);
    const event = firstValueFrom(service.stream(user));

    await service.createForUser(user.userId, {
      title: 'Nova atualização',
      description: 'Evento em tempo real',
      module: 'Avisos',
    });

    await expect(event).resolves.toEqual({ data: { refresh: true } });
  });
});
