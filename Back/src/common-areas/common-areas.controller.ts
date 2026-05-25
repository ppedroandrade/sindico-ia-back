import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommonAreasService } from './common-areas.service';
import { CreateAreaItemDto, CreateCommonAreaDto } from './dto/create-common-area.dto';
import { UpdateCommonAreaDto } from './dto/update-common-area.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('common-areas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommonAreasController {
  constructor(private readonly commonAreasService: CommonAreasService) {}

  @Roles('admin')
  @Post()
  create(@Body() dto: CreateCommonAreaDto) {
    return this.commonAreasService.create(dto);
  }

  @Get()
  findAll() {
    return this.commonAreasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commonAreasService.findOne(id);
  }

  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCommonAreaDto) {
    return this.commonAreasService.update(id, dto);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commonAreasService.remove(id);
  }

  @Roles('admin')
  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() dto: CreateAreaItemDto) {
    return this.commonAreasService.addItem(id, dto);
  }

  @Roles('admin')
  @Delete('items/:itemId')
  removeItem(@Param('itemId') itemId: string) {
    return this.commonAreasService.removeItem(itemId);
  }
}
