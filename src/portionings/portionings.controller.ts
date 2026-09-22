import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PortioningsService } from './portionings.service.js';
import { CreatePortioningDto, UpdatePortioningDto } from '../dto/portioning.dto.js';
import { RequestWithUser } from '../types/request-with-user.js';

@UseGuards(AuthGuard('jwt'))
@Controller('portionings')
export class PortioningsController {
  constructor(private portioningsService: PortioningsService) {}

  @Post()
  create(@Body() dto: CreatePortioningDto, @Req() req: RequestWithUser) {
    return this.portioningsService.create(dto, req.user.userId);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.portioningsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.portioningsService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePortioningDto) {
    return this.portioningsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.portioningsService.remove(id);
  }
}
