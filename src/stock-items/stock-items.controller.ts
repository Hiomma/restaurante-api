import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StockItemsService } from './stock-items.service.js';
import { CreateStockItemDto, UpdateStockItemDto, StockItemQueryDto } from '../dto/stock-item.dto.js';
import { RequestWithUser } from '../types/request-with-user.js';

@UseGuards(AuthGuard('jwt'))
@Controller('stock-items')
export class StockItemsController {
  constructor(private stockItemsService: StockItemsService) {}

  @Post()
  create(@Body() dto: CreateStockItemDto, @Req() req: RequestWithUser) {
    return this.stockItemsService.create(dto, req.user.userId);
  }

  @Get()
  findAll(@Req() req: RequestWithUser, @Query() query: StockItemQueryDto) {
    return this.stockItemsService.findAll(req.user.userId, query);
  }

  @Get('low-stock')
  getLowStock(@Req() req: RequestWithUser) {
    return this.stockItemsService.getLowStock(req.user.userId);
  }

  @Get('qr/:qrCode')
  findByQrCode(@Param('qrCode') qrCode: string) {
    return this.stockItemsService.findByQrCode(qrCode);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockItemsService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStockItemDto) {
    return this.stockItemsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockItemsService.remove(id);
  }
}
