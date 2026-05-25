import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { AuthenticatedRequest } from '../auth/user-request.interface';

@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Roles('morador', 'admin')
  @Post()
  create(@Body() dto: CreateReservationDto, @Req() req: AuthenticatedRequest) {
    return this.reservationsService.create(dto, req.user);
  }

  @Roles('admin', 'morador', 'limpeza')
  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.reservationsService.findAll(req.user);
  }

  @Roles('admin', 'morador')
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.reservationsService.findOne(id, req.user);
  }

  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateReservationDto) {
    return this.reservationsService.update(id, dto);
  }

  @Roles('admin', 'morador')
  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.reservationsService.cancel(id, req.user);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reservationsService.remove(id);
  }
}
