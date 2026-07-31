import { OperationsService } from './operations.service';

describe('OperationsService portaria', () => {
  it('checks visitor in and writes audit log', async () => {
    const prisma = {
      visitorAccess: {
        update: jest
          .fn()
          .mockResolvedValue({ id: 'visitor-1', status: 'checked_in' }),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
      },
    };
    const service = new OperationsService(prisma as any, {} as any);

    const result = await service.updateVisitorStatus(
      'visitor-1',
      'checked_in',
      {
        userId: 'admin-1',
        email: 'admin@sindico.com',
        role: 'admin',
      },
    );

    expect(result.status).toBe('checked_in');
    expect(prisma.visitorAccess.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'visitor-1' },
        data: expect.objectContaining({
          status: 'checked_in',
          checkedInAt: expect.any(Date),
        }),
      }),
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'update',
          entity: 'visitor',
          entityId: 'visitor-1',
        }),
      }),
    );
  });
});
