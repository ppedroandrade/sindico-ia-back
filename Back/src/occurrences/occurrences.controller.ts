import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OccurrencesService } from './occurrences.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { AuthenticatedRequest } from '../auth/user-request.interface';
import { CreateOccurrenceDto } from './dto/create-occurrence.dto';
import { UpdateOccurrenceDto } from './dto/update-occurrence.dto';

@Controller('occurrences')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OccurrencesController {
  constructor(private readonly occurrencesService: OccurrencesService) {}

  @Roles('admin', 'morador')
  @Post()
  create(@Body() dto: CreateOccurrenceDto, @Req() req: AuthenticatedRequest) {
    return this.occurrencesService.create(dto, req.user);
  }

  @Roles('admin', 'morador')
  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.occurrencesService.findAll(req.user);
  }

  @Roles('admin', 'morador')
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.occurrencesService.findOne(id, req.user);
  }

  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOccurrenceDto) {
    return this.occurrencesService.update(id, dto);
  }
}
