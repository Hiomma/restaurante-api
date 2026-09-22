import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AgendaItemsService } from './agenda-items.service.js';
import { CreateAgendaItemDto, UpdateAgendaItemDto } from '../dto/agenda-item.dto.js';
import { RequestWithUser } from '../types/request-with-user.js';

@UseGuards(AuthGuard('jwt'))
@Controller('agenda-items')
export class AgendaItemsController {
  constructor(private agendaItemsService: AgendaItemsService) {}

  @Post()
  create(@Body() dto: CreateAgendaItemDto, @Req() req: RequestWithUser) {
    return this.agendaItemsService.create(dto, req.user.userId);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.agendaItemsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agendaItemsService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAgendaItemDto) {
    return this.agendaItemsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agendaItemsService.remove(id);
  }
}
