import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtUser } from '../auth/user-request.interface';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService) {}

  findConversations(user: JwtUser) {
    return this.prisma.aiConversation.findMany({
      where: { userId: user.userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createMessage(data: CreateMessageDto, user: JwtUser) {
    const conversation = data.conversationId
      ? await this.prisma.aiConversation.findUnique({ where: { id: data.conversationId } })
      : await this.prisma.aiConversation.create({
          data: {
            userId: user.userId,
            title: data.content.slice(0, 60),
            context: { source: 'condominium-chat' },
          },
        });

    if (!conversation || conversation.userId !== user.userId) {
      throw new NotFoundException('Conversa não encontrada');
    }

    const message = await this.prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        userId: user.userId,
        role: 'user',
        content: data.content,
        metadata: { aiStatus: 'queued' },
      },
    });

    await this.prisma.aiConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return {
      conversationId: conversation.id,
      message,
      aiStatus: 'not_configured',
    };
  }
}
