import { Module } from '@nestjs/common';
import { CommonAreasService } from './common-areas.service';
import { CommonAreasController } from './common-areas.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [CommonAreasController],
  providers: [CommonAreasService, PrismaService],
  exports: [CommonAreasService],
})
export class CommonAreasModule {}
