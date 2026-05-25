import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { JwtUser } from '../auth/user-request.interface';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateAnnouncementDto, user: JwtUser) {
    return this.prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
        publishAt: data.publishAt ? new Date(data.publishAt) : new Date(),
        authorId: user.userId,
      },
      include: { author: true },
    });
  }

  findAll() {
    return this.prisma.announcement.findMany({
      include: { author: true },
      orderBy: [{ publishAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
      include: { author: true },
    });
    if (!announcement) throw new NotFoundException('Aviso não encontrado');
    return announcement;
  }

  async update(id: string, data: UpdateAnnouncementDto) {
    await this.findOne(id);
    return this.prisma.announcement.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
        publishAt: data.publishAt ? new Date(data.publishAt) : undefined,
      },
      include: { author: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.announcement.delete({ where: { id } });
  }
}
