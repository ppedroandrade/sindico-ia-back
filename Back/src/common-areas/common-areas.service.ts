import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateAreaItemDto, CreateCommonAreaDto } from './dto/create-common-area.dto';
import { UpdateCommonAreaDto } from './dto/update-common-area.dto';

@Injectable()
export class CommonAreasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCommonAreaDto) {
    const existing = await this.prisma.commonArea.findUnique({
      where: { name: data.name },
    });
    if (existing) throw new ConflictException('Área comum já cadastrada');

    const { items, ...areaData } = data;
    return this.prisma.commonArea.create({
      data: {
        ...areaData,
        items: items?.length
          ? {
              create: items.map((item) => ({
                ...item,
                category: item.category ?? 'general',
              })),
            }
          : undefined,
      },
      include: { items: true, reservations: true },
    });
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
    const { items, ...areaData } = data;
    return this.prisma.commonArea.update({
      where: { id },
      data: areaData,
      include: { items: true, reservations: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.commonArea.delete({ where: { id } });
  }

  async addItem(areaId: string, data: CreateAreaItemDto) {
    await this.findOne(areaId);
    return this.prisma.areaItem.create({
      data: {
        ...data,
        category: data.category ?? 'general',
        areaId,
      },
    });
  }

  async removeItem(itemId: string) {
    const item = await this.prisma.areaItem.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Item não encontrado');
    return this.prisma.areaItem.delete({ where: { id: itemId } });
  }
}
