import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MovementDestinationsService } from './movement-destinations.service.js';
import { CreateMovementDestinationDto, UpdateMovementDestinationDto } from '../dto/movement-destination.dto.js';
import { RequestWithUser } from '../types/request-with-user.js';

@UseGuards(AuthGuard('jwt'))
@Controller('movement-destinations')
export class MovementDestinationsController {
  constructor(private destinationsService: MovementDestinationsService) {}

  @Post()
  create(@Body() dto: CreateMovementDestinationDto, @Req() req: RequestWithUser) {
    return this.destinationsService.create(dto, req.user.userId);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.destinationsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.destinationsService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMovementDestinationDto) {
    return this.destinationsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.destinationsService.remove(id);
  }
}
