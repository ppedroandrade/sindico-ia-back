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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { AuthenticatedRequest } from '../auth/user-request.interface';
import { OperationsService } from './operations.service';

@Controller('operations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Roles('admin', 'morador', 'limpeza')
  @Get('settings')
  getSettings() {
    return this.operationsService.getSettings();
  }

  @Roles('admin')
  @Patch('settings')
  updateSettings(
    @Body() body: Record<string, unknown>,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.operationsService.updateSettings(body, req.user);
  }

  @Roles('admin', 'morador', 'limpeza')
  @Get(':entity')
  list(@Param('entity') entity: any, @Req() req: AuthenticatedRequest) {
    return this.operationsService.list(entity, req.user);
  }

  @Roles('admin', 'morador', 'limpeza')
  @Post(':entity')
  create(
    @Param('entity') entity: any,
    @Body() body: Record<string, unknown>,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.operationsService.create(entity, body, req.user);
  }

  @Roles('admin', 'morador', 'limpeza')
  @Patch(':entity/:id')
  update(
    @Param('entity') entity: any,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.operationsService.update(entity, id, body, req.user);
  }

  @Roles('admin')
  @Patch('visitors/:id/status')
  updateVisitorStatus(
    @Param('id') id: string,
    @Body() body: { status: 'checked_in' | 'checked_out' | 'cancelled' },
    @Req() req: AuthenticatedRequest,
  ) {
    return this.operationsService.updateVisitorStatus(
      id,
      body.status,
      req.user,
    );
  }

  @Roles('admin')
  @Delete(':entity/:id')
  remove(
    @Param('entity') entity: any,
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.operationsService.remove(entity, id, req.user);
  }

  @Roles('admin')
  @Post('units/:unitId/residents')
  addResident(
    @Param('unitId') unitId: string,
    @Body() body: Record<string, unknown>,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.operationsService.addResident(unitId, body, req.user);
  }

  @Roles('admin')
  @Delete('unit-residents/:id')
  removeResident(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.operationsService.removeResident(id, req.user);
  }

  @Roles('admin', 'morador')
  @Post('assemblies/:assemblyId/votes')
  voteAssembly(
    @Param('assemblyId') assemblyId: string,
    @Body() body: Record<string, unknown>,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.operationsService.voteAssembly(assemblyId, body, req.user);
  }

  @Roles('admin', 'morador')
  @Get('occurrences/:occurrenceId/comments')
  listOccurrenceComments(
    @Param('occurrenceId') occurrenceId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.operationsService.listOccurrenceComments(
      occurrenceId,
      req.user,
    );
  }

  @Roles('admin', 'morador')
  @Post('occurrences/:occurrenceId/comments')
  addOccurrenceComment(
    @Param('occurrenceId') occurrenceId: string,
    @Body() body: Record<string, unknown>,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.operationsService.addOccurrenceComment(
      occurrenceId,
      body,
      req.user,
    );
  }
}
