import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { OperationsController } from './operations.controller';
import { OperationsService } from './operations.service';

@Module({
  controllers: [OperationsController],
  providers: [OperationsService, PrismaService],
})
export class OperationsModule {}
