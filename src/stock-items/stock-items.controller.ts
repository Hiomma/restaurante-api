import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StockItemsService } from './stock-items.service.js';
import { CreateStockItemDto, UpdateStockItemDto, StockItemQueryDto } from '../dto/stock-item.dto.js';
import { RequestWithUser } from '../types/request-with-user.js';
import { scopeOf } from '../types/scope.js';

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
    return this.stockItemsService.findAll(scopeOf(req.user), query);
  }

  @Get('low-stock')
  getLowStock(@Req() req: RequestWithUser) {
    return this.stockItemsService.getLowStock(scopeOf(req.user));
  }

  @Get('qr/:qrCode')
  findByQrCode(@Param('qrCode') qrCode: string, @Req() req: RequestWithUser) {
    return this.stockItemsService.findByQrCode(qrCode, scopeOf(req.user));
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.stockItemsService.findById(id, scopeOf(req.user));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStockItemDto, @Req() req: RequestWithUser) {
    return this.stockItemsService.update(id, dto, scopeOf(req.user));
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.stockItemsService.remove(id, scopeOf(req.user));
  }
}
