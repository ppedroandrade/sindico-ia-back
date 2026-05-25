import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/user-request.interface';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('conversations')
  findConversations(@Req() req: AuthenticatedRequest) {
    return this.aiService.findConversations(req.user);
  }

  @Post('messages')
  createMessage(@Body() dto: CreateMessageDto, @Req() req: AuthenticatedRequest) {
    return this.aiService.createMessage(dto, req.user);
  }
}
