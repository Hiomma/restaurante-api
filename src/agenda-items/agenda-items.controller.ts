import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AgendaItemsService } from './agenda-items.service.js';
import { CreateAgendaItemDto, UpdateAgendaItemDto } from '../dto/agenda-item.dto.js';
import { RequestWithUser } from '../types/request-with-user.js';
import { scopeOf } from '../types/scope.js';
import { EmployeeRestrictionsGuard } from '../common/employee-restrictions.guard.js';
import { RestrictEmployee } from '../common/restrict-employee.decorator.js';

@UseGuards(AuthGuard('jwt'), EmployeeRestrictionsGuard)
@Controller('agenda-items')
export class AgendaItemsController {
  constructor(private agendaItemsService: AgendaItemsService) {}

  @Post()
  @RestrictEmployee()
  create(@Body() dto: CreateAgendaItemDto, @Req() req: RequestWithUser) {
    return this.agendaItemsService.create(dto, req.user.userId);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.agendaItemsService.findAll(scopeOf(req.user));
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.agendaItemsService.findById(id, scopeOf(req.user));
  }

  @Put(':id')
  @RestrictEmployee()
  update(@Param('id') id: string, @Body() dto: UpdateAgendaItemDto, @Req() req: RequestWithUser) {
    return this.agendaItemsService.update(id, dto, scopeOf(req.user));
  }

  @Delete(':id')
  @RestrictEmployee()
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.agendaItemsService.remove(id, scopeOf(req.user));
  }
}
