import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CommonAreasModule } from './common-areas/common-areas.module';
import { ReservationsModule } from './reservations/reservations.module';
import { PrismaService } from './prisma.service';
import { AnnouncementsModule } from './announcements/announcements.module';
import { OccurrencesModule } from './occurrences/occurrences.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AiModule } from './ai/ai.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    CommonAreasModule,
    ReservationsModule,
    AnnouncementsModule,
    OccurrencesModule,
    DashboardModule,
    AiModule,
    UsersModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
