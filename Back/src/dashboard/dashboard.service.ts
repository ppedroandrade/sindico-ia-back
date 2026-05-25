import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const [
      residents,
      commonAreas,
      pendingReservations,
      openOccurrences,
      announcements,
      recentReservations,
      recentOccurrences,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'morador' } }),
      this.prisma.commonArea.count(),
      this.prisma.reservation.count({ where: { status: 'pending' } }),
      this.prisma.occurrence.count({ where: { status: { in: ['open', 'in_progress'] } } }),
      this.prisma.announcement.count(),
      this.prisma.reservation.findMany({
        take: 5,
        include: { user: true, area: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.occurrence.findMany({
        take: 5,
        include: { reporter: true },
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
      recentReservations,
      recentOccurrences,
    };
  }
}
