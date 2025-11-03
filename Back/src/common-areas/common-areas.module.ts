import { Module } from '@nestjs/common';
import { CommonAreasService } from './services/common-areas.service';
import { CommonAreasController } from './common-areas.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CommonAreasController],
  providers: [CommonAreasService],
  exports: [CommonAreasService],
})
export class CommonAreasModule {}
