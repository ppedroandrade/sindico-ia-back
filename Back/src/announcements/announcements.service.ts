import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { JwtUser } from '../auth/user-request.interface';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AnnouncementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  private readonly safeAuthorSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    apartment: true,
  };

  async create(data: CreateAnnouncementDto, user: JwtUser) {
    const announcement = await this.prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
        publishAt: data.publishAt ? new Date(data.publishAt) : new Date(),
        authorId: user.userId,
      },
      include: { author: { select: this.safeAuthorSelect } },
    });
    await this.notifications.createForResidents({
      type:
        announcement.type === 'urgent'
          ? 'error'
          : announcement.type === 'warning'
            ? 'warning'
            : 'info',
      title: 'Novo comunicado',
      description: announcement.title,
      module: 'Avisos',
      link: '/avisos',
    });
    return announcement;
  }

  findAll() {
    return this.prisma.announcement.findMany({
      include: { author: { select: this.safeAuthorSelect } },
      orderBy: [{ publishAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
      include: { author: { select: this.safeAuthorSelect } },
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
      include: { author: { select: this.safeAuthorSelect } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.announcement.delete({ where: { id } });
  }
}
