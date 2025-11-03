import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommonAreaDto } from '../dto/create-common-area.dto';
import { UpdateCommonAreaDto } from '../dto/update-common-area.dto';

@Injectable()
export class CommonAreasService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateCommonAreaDto) {
    return this.prisma.commonArea.create({ data });
  }

  async findAll() {
    return this.prisma.commonArea.findMany({
      include: { items: true, reservations: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const area = await this.prisma.commonArea.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!area) throw new NotFoundException('Área comum não encontrada');
    return area;
  }

  async update(id: string, data: UpdateCommonAreaDto) {
    await this.findOne(id);
    return this.prisma.commonArea.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.commonArea.delete({ where: { id } });
  }
}
