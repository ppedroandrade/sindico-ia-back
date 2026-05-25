import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { JwtUser } from '../auth/user-request.interface';
import { CreateOccurrenceDto } from './dto/create-occurrence.dto';
import { UpdateOccurrenceDto } from './dto/update-occurrence.dto';

@Injectable()
export class OccurrencesService {
  constructor(private readonly prisma: PrismaService) {}

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

  create(data: CreateOccurrenceDto, user: JwtUser) {
    return this.prisma.occurrence.create({
      data: {
        ...data,
        reporterId: user.userId,
      },
      include: this.includeUsers,
    });
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
    const occurrence = await this.prisma.occurrence.findUnique({ where: { id } });
    if (!occurrence) throw new NotFoundException('Ocorrência não encontrada');
    return this.prisma.occurrence.update({
      where: { id },
      data,
      include: this.includeUsers,
    });
  }
}
