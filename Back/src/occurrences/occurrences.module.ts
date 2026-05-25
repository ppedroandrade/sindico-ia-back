import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { OccurrencesController } from './occurrences.controller';
import { OccurrencesService } from './occurrences.service';

@Module({
  controllers: [OccurrencesController],
  providers: [OccurrencesService, PrismaService],
})
export class OccurrencesModule {}
