import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { JwtUser } from '../auth/user-request.interface';
import { Prisma, ReservationStatus } from '@prisma/client';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

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

  private getTotalPrice(startTime: Date, endTime: Date, pricePerHour: number) {
    const durationMs = endTime.getTime() - startTime.getTime();
    if (durationMs <= 0) {
      throw new BadRequestException('Horário final deve ser posterior ao inicial');
    }
    const hours = Math.ceil(durationMs / (1000 * 60 * 60));
    return hours * pricePerHour;
  }

  async create(data: CreateReservationDto, user: JwtUser) {
    const area = await this.prisma.commonArea.findUnique({
      where: { id: data.areaId },
    });
    if (!area) throw new NotFoundException('Área comum não encontrada');
    if (!area.available) throw new BadRequestException('Área comum indisponível');

    const startTime = this.toDate(data.startTime);
    const endTime = this.toDate(data.endTime);
    const date = this.toDate(data.date);
    const userId = user.role === 'admin' && data.userId ? data.userId : user.userId;

    if (data.guests > area.capacity) {
      throw new BadRequestException('Número de convidados excede a capacidade da área');
    }

    const overlapping = await this.prisma.reservation.findFirst({
      where: {
        areaId: data.areaId,
        status: { in: [ReservationStatus.pending, ReservationStatus.confirmed] },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });
    if (overlapping) throw new BadRequestException('Já existe reserva nesse horário');

    return this.prisma.reservation.create({
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
  }

  async findAll(user: JwtUser) {
    const where: Prisma.ReservationWhereInput =
      user.role === 'admin' || user.role === 'limpeza' ? {} : { userId: user.userId };

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
    await this.findOne(id);
    const startTime = data.startTime ? this.toDate(data.startTime) : undefined;
    const endTime = data.endTime ? this.toDate(data.endTime) : undefined;
    const date = data.date ? this.toDate(data.date) : undefined;
    const area = data.areaId
      ? await this.prisma.commonArea.findUnique({ where: { id: data.areaId } })
      : undefined;
    if (data.areaId && !area) throw new NotFoundException('Área comum não encontrada');

    const { status, observations, userId, areaId, guests } = data;
    return this.prisma.reservation.update({
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
  }

  async cancel(id: string, user: JwtUser) {
    const reservation = await this.findOne(id, user);

    if (reservation.status === ReservationStatus.cancelled) {
      return reservation;
    }

    if (reservation.status === ReservationStatus.completed) {
      throw new BadRequestException('Reserva concluída não pode ser cancelada');
    }

    return this.prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.cancelled },
      include: this.reservationInclude,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.reservation.delete({ where: { id } });
  }
}
