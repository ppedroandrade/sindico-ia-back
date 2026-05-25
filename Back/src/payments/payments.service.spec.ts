import { PaymentsService } from './payments.service';

describe('PaymentsService reports', () => {
  it('aggregates totals, overdue payments and monthly buckets', async () => {
    const service = new PaymentsService({
      payment: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'paid',
            amount: 100,
            status: 'paid',
            dueDate: new Date('2026-05-10T00:00:00.000Z'),
            referenceMonth: '2026-05',
            user: { id: 'u1', name: 'Morador 1' },
          },
          {
            id: 'late',
            amount: 50,
            status: 'pending',
            dueDate: new Date('2020-01-10T00:00:00.000Z'),
            referenceMonth: '2020-01',
            user: { id: 'u2', name: 'Morador 2' },
          },
        ]),
      },
    } as any);

    const report = await service.getReport({ userId: 'admin', email: 'admin@sindico.com', role: 'admin' });

    expect(report.summary.total).toBe(150);
    expect(report.summary.paid).toBe(100);
    expect(report.summary.pending).toBe(50);
    expect(report.summary.overdue).toBe(50);
    expect(report.byMonth['2026-05'].paid).toBe(100);
    expect(report.defaulters).toHaveLength(1);
  });
});
