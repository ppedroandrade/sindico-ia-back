import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [AiController],
  providers: [AiService, PrismaService],
})
export class AiModule {}
