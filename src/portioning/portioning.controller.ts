import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { PortioningService } from './portioning.service';
import { CreatePortioningDto, UpdatePortioningDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('portioning')
@UseGuards(JwtAuthGuard)
export class PortioningController {
  constructor(private portioningService: PortioningService) {}

  @Post()
  create(@Body() dto: CreatePortioningDto) {
    return this.portioningService.create(dto);
  }

  @Get()
  findAll() {
    return this.portioningService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.portioningService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePortioningDto) {
    return this.portioningService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.portioningService.remove(id);
  }
}
