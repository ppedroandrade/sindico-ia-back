import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateReservationDto) {
    return this.prisma.reservation.create({
      data,
      include: { area: true, user: true },
    });
  }

  async findAll() {
    return this.prisma.reservation.findMany({
      include: { user: true, area: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { area: true, user: true },
    });
    if (!reservation) throw new NotFoundException('Reserva não encontrada');
    return reservation;
  }

  async update(id: string, data: UpdateReservationDto) {
    await this.findOne(id);
    return this.prisma.reservation.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.reservation.delete({ where: { id } });
  }
}
