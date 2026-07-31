import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { CommonAreasModule } from './common-areas/common-areas.module';
import { ReservationsModule } from './reservations/reservations.module';
import { PrismaService } from './prisma.service';
import { AnnouncementsModule } from './announcements/announcements.module';
import { OccurrencesModule } from './occurrences/occurrences.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AiModule } from './ai/ai.module';
import { UsersModule } from './users/users.module';
import { PaymentsModule } from './payments/payments.module';
import { OperationsModule } from './operations/operations.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    AuthModule,
    CommonAreasModule,
    ReservationsModule,
    AnnouncementsModule,
    OccurrencesModule,
    DashboardModule,
    AiModule,
    UsersModule,
    PaymentsModule,
    OperationsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    PrismaService,
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
