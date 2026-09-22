import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StockMovementsService } from './stock-movements.service.js';
import { CreateStockMovementDto, UpdateStockMovementDto } from '../dto/stock-movement.dto.js';
import { RequestWithUser } from '../types/request-with-user.js';

@UseGuards(AuthGuard('jwt'))
@Controller('stock-movements')
export class StockMovementsController {
  constructor(private stockMovementsService: StockMovementsService) {}

  @Post()
  create(@Body() dto: CreateStockMovementDto, @Req() req: RequestWithUser) {
    return this.stockMovementsService.create(dto, req.user.userId);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.stockMovementsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockMovementsService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStockMovementDto) {
    return this.stockMovementsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockMovementsService.remove(id);
  }
}
