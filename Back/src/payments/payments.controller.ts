import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { AuthenticatedRequest } from '../auth/user-request.interface';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Roles('admin')
  @Post()
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @Roles('admin')
  @Post('batch')
  createBatch(@Body() dto: { userIds?: string[]; amount: number; dueDate: string; type: string; referenceMonth?: string }) {
    return this.paymentsService.createBatch(dto);
  }

  @Roles('admin', 'morador')
  @Get('report')
  report(@Req() req: AuthenticatedRequest) {
    return this.paymentsService.getReport(req.user);
  }

  @Roles('admin', 'morador')
  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.paymentsService.findAll(req.user);
  }

  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    return this.paymentsService.update(id, dto);
  }

  @Roles('admin', 'morador')
  @Patch(':id/pay')
  markPaid(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.paymentsService.markPaid(id, req.user);
  }

  @Roles('admin', 'morador')
  @Get(':id/pix')
  generatePix(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.paymentsService.generatePix(id, req.user);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
