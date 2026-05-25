import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly safeUserSelect = {
    id: true,
    name: true,
    email: true,
    apartment: true,
    parkingSpaces: true,
    role: true,
  };

  async getSummary() {
    const [
      residents,
      commonAreas,
      pendingReservations,
      openOccurrences,
      announcements,
      paidPayments,
      pendingPayments,
      overduePayments,
      recentReservations,
      recentOccurrences,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'morador', active: true } }),
      this.prisma.commonArea.count(),
      this.prisma.reservation.count({ where: { status: 'pending' } }),
      this.prisma.occurrence.count({ where: { status: { in: ['open', 'in_progress'] } } }),
      this.prisma.announcement.count(),
      this.prisma.payment.aggregate({
        where: { status: 'paid' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.payment.aggregate({
        where: { status: { not: 'paid' } },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.payment.count({
        where: {
          status: { not: 'paid' },
          dueDate: { lt: new Date() },
        },
      }),
      this.prisma.reservation.findMany({
        take: 5,
        include: {
          user: { select: this.safeUserSelect },
          area: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.occurrence.findMany({
        take: 5,
        include: {
          reporter: { select: this.safeUserSelect },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      stats: {
        residents,
        commonAreas,
        pendingReservations,
        openOccurrences,
        announcements,
      },
      financial: {
        paidTotal: paidPayments._sum.amount ?? 0,
        pendingTotal: pendingPayments._sum.amount ?? 0,
        paidCount: paidPayments._count,
        pendingCount: pendingPayments._count,
        overdueCount: overduePayments,
      },
      recentReservations,
      recentOccurrences,
    };
  }
}
