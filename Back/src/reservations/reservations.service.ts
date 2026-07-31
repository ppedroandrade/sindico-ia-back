import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { JwtUser } from '../auth/user-request.interface';
import { Prisma, ReservationStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  private readonly reservationInclude = {
    area: true,
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        cpf: true,
        apartment: true,
        parkingSpaces: true,
        createdAt: true,
        updatedAt: true,
      },
    },
  };

  private toDate(date: string) {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException('Data inválida');
    }
    return parsed;
  }

  private getDayRange(date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  private getTotalPrice(startTime: Date, endTime: Date, pricePerHour: number) {
    const durationMs = endTime.getTime() - startTime.getTime();
    if (durationMs <= 0) {
      throw new BadRequestException(
        'Horário final deve ser posterior ao inicial',
      );
    }
    const hours = Math.ceil(durationMs / (1000 * 60 * 60));
    return hours * pricePerHour;
  }

  async create(data: CreateReservationDto, user: JwtUser) {
    const area = await this.prisma.commonArea.findUnique({
      where: { id: data.areaId },
    });
    if (!area) throw new NotFoundException('Área comum não encontrada');
    if (!area.available)
      throw new BadRequestException('Área comum indisponível');

    const startTime = this.toDate(data.startTime);
    const endTime = this.toDate(data.endTime);
    const date = this.toDate(data.date);
    const userId =
      user.role === 'admin' && data.userId ? data.userId : user.userId;

    if (data.guests > area.capacity) {
      throw new BadRequestException(
        'Número de convidados excede a capacidade da área',
      );
    }

    const { start: dayStart, end: dayEnd } = this.getDayRange(date);
    const sameDayReservation = await this.prisma.reservation.findFirst({
      where: {
        areaId: data.areaId,
        status: {
          in: [ReservationStatus.pending, ReservationStatus.confirmed],
        },
        date: { gte: dayStart, lte: dayEnd },
      },
    });
    if (sameDayReservation)
      throw new BadRequestException(
        'Já existe solicitação de reserva para essa área neste dia',
      );

    const reservation = await this.prisma.reservation.create({
      data: {
        userId,
        areaId: data.areaId,
        date,
        startTime,
        endTime,
        guests: data.guests,
        totalPrice: this.getTotalPrice(startTime, endTime, area.pricePerHour),
        observations: data.observations,
      },
      include: this.reservationInclude,
    });
    const description = `${reservation.area.name} para ${reservation.date.toLocaleDateString('pt-BR')}.`;
    await Promise.all([
      this.notifications.createForUser(reservation.userId, {
        type: 'info',
        title: 'Solicitação de reserva criada',
        description,
        module: 'Reservas',
        link: '/reservas',
      }),
      this.notifications.createForAdmins({
        type: 'warning',
        title: 'Nova reserva aguardando aprovação',
        description: `${reservation.user.name} solicitou ${description}`,
        module: 'Reservas',
        link: '/reservas',
      }),
    ]);
    return reservation;
  }

  async findAll(user: JwtUser) {
    const where: Prisma.ReservationWhereInput =
      user.role === 'admin' || user.role === 'limpeza'
        ? {}
        : { userId: user.userId };

    return this.prisma.reservation.findMany({
      where,
      include: this.reservationInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user?: JwtUser) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: this.reservationInclude,
    });
    if (!reservation) throw new NotFoundException('Reserva não encontrada');
    if (user?.role === 'morador' && reservation.userId !== user.userId) {
      throw new ForbiddenException('Acesso negado');
    }
    return reservation;
  }

  async update(id: string, data: UpdateReservationDto) {
    const current = await this.findOne(id);
    const startTime = data.startTime ? this.toDate(data.startTime) : undefined;
    const endTime = data.endTime ? this.toDate(data.endTime) : undefined;
    const date = data.date ? this.toDate(data.date) : undefined;
    const area = data.areaId
      ? await this.prisma.commonArea.findUnique({ where: { id: data.areaId } })
      : undefined;
    if (data.areaId && !area)
      throw new NotFoundException('Área comum não encontrada');

    const nextDate = date ?? current.date;
    const nextAreaId = data.areaId ?? current.areaId;
    const { start: dayStart, end: dayEnd } = this.getDayRange(nextDate);
    const sameDayReservation = await this.prisma.reservation.findFirst({
      where: {
        id: { not: id },
        areaId: nextAreaId,
        status: {
          in: [ReservationStatus.pending, ReservationStatus.confirmed],
        },
        date: { gte: dayStart, lte: dayEnd },
      },
    });
    if (sameDayReservation) {
      throw new BadRequestException(
        'Já existe solicitação de reserva para essa área neste dia',
      );
    }

    const { status, observations, userId, areaId, guests } = data;
    const updated = await this.prisma.reservation.update({
      where: { id },
      data: {
        status,
        observations,
        userId,
        areaId,
        guests,
        date,
        startTime,
        endTime,
        totalPrice:
          startTime && endTime && area
            ? this.getTotalPrice(startTime, endTime, area.pricePerHour)
            : undefined,
      },
      include: this.reservationInclude,
    });
    if (status && status !== current.status) await this.notifyStatus(updated);
    return updated;
  }

  async cancel(id: string, user: JwtUser) {
    const reservation = await this.findOne(id, user);

    if (reservation.status === ReservationStatus.cancelled) {
      return reservation;
    }

    if (reservation.status === ReservationStatus.completed) {
      throw new BadRequestException('Reserva concluída não pode ser cancelada');
    }

    const updated = await this.prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.cancelled },
      include: this.reservationInclude,
    });
    await this.notifyStatus(updated);
    return updated;
  }

  async updateStatus(id: string, status: string) {
    if (
      !Object.values(ReservationStatus).includes(status as ReservationStatus)
    ) {
      throw new BadRequestException('Status de reserva inválido');
    }

    const current = await this.findOne(id);
    if (current.status === status) return current;
    const updated = await this.prisma.reservation.update({
      where: { id },
      data: { status: status as ReservationStatus },
      include: this.reservationInclude,
    });
    await this.notifyStatus(updated);
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.reservation.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'Não é possível excluir esta reserva pois existem registros vinculados a ela.',
        );
      }
      throw error;
    }
  }

  private async notifyStatus(
    reservation: Awaited<ReturnType<ReservationsService['findOne']>>,
  ) {
    const labels: Record<
      ReservationStatus,
      { title: string; type: 'info' | 'success' | 'warning' | 'error' }
    > = {
      pending: { title: 'Reserva aguardando aprovação', type: 'warning' },
      confirmed: { title: 'Reserva aprovada', type: 'success' },
      cancelled: { title: 'Reserva cancelada', type: 'error' },
      completed: { title: 'Reserva concluída', type: 'success' },
    };
    const current = labels[reservation.status];
    const payload = {
      type: current.type,
      title: current.title,
      description: `${reservation.area.name} em ${reservation.date.toLocaleDateString('pt-BR')}.`,
      module: 'Reservas',
      link: '/reservas',
    };
    await Promise.all([
      this.notifications.createForUser(reservation.userId, payload),
      this.notifications.createForAdmins({
        ...payload,
        description: `${reservation.user.name}: ${payload.description}`,
      }),
    ]);
  }
}
