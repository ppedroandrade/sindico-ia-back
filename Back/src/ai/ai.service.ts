import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { JwtUser } from '../auth/user-request.interface';
import { CreateMessageDto } from './dto/create-message.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  private readonly conversationInclude = {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        apartment: true,
      },
    },
    messages: { orderBy: { createdAt: 'asc' as const } },
  };

  findConversations(user: JwtUser) {
    return this.prisma.aiConversation.findMany({
      where: user.role === Role.admin ? {} : { userId: user.userId },
      include: this.conversationInclude,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createMessage(data: CreateMessageDto, user: JwtUser) {
    const conversation = data.conversationId
      ? await this.prisma.aiConversation.findUnique({
          where: { id: data.conversationId },
        })
      : await this.prisma.aiConversation.create({
          data: {
            userId: user.userId,
            title: data.content.slice(0, 60),
            context: { source: 'condominium-chat' },
          },
        });

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada');
    }

    if (user.role !== Role.admin && conversation.userId !== user.userId) {
      throw new NotFoundException('Conversa não encontrada');
    }

    const role = user.role === Role.admin ? (data.role ?? 'assistant') : 'user';
    if (user.role !== Role.admin && data.role === 'assistant') {
      throw new ForbiddenException('Acesso negado');
    }

    const message = await this.prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        userId: role === 'user' ? user.userId : null,
        role,
        content: data.content,
        metadata: {
          aiStatus: role === 'user' ? 'queued' : 'answered_by_admin',
          authorUserId: user.userId,
        },
      },
    });

    await this.prisma.aiConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    if (role === 'user') {
      await this.notifications.createForAdmins({
        type: 'info',
        title: 'Nova mensagem no chat',
        description: data.content.slice(0, 100),
        module: 'Chatbot / IA',
        link: '/chatbot',
      });
    } else {
      await this.notifications.createForUser(conversation.userId, {
        type: 'info',
        title: 'Nova resposta no chat',
        description: data.content.slice(0, 100),
        module: 'Chatbot / IA',
        link: '/chatbot',
      });
    }

    return {
      conversationId: conversation.id,
      message,
      aiStatus: 'not_configured',
    };
  }
}
