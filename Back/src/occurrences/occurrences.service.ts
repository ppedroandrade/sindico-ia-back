import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { JwtUser } from '../auth/user-request.interface';
import { CreateOccurrenceDto } from './dto/create-occurrence.dto';
import { UpdateOccurrenceDto } from './dto/update-occurrence.dto';

@Injectable()
export class OccurrencesService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateOccurrenceDto, user: JwtUser) {
    return this.prisma.occurrence.create({
      data: {
        ...data,
        reporterId: user.userId,
      },
      include: { reporter: true, assignee: true },
    });
  }

  findAll(user: JwtUser) {
    const where: Prisma.OccurrenceWhereInput =
      user.role === Role.admin ? {} : { reporterId: user.userId };
    return this.prisma.occurrence.findMany({
      where,
      include: { reporter: true, assignee: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: JwtUser) {
    const occurrence = await this.prisma.occurrence.findUnique({
      where: { id },
      include: { reporter: true, assignee: true },
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
      include: { reporter: true, assignee: true },
    });
  }
}
