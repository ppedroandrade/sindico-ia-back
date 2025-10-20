import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CommonAreasModule } from './common-areas/common-areas.module';
import { ReservationsModule } from './reservations/reservations.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    CommonAreasModule,
    ReservationsModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
