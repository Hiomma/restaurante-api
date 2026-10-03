import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service.js';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto.js';
import { RequestWithUser } from '../types/request-with-user.js';
import { scopeOf } from '../types/scope.js';

@UseGuards(AuthGuard('jwt'))
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto, @Req() req: RequestWithUser) {
    return this.productsService.create(dto, req.user.userId);
  }

  @Get()
  findAll(@Req() req: RequestWithUser, @Query('search') search?: string) {
    return this.productsService.findAll(scopeOf(req.user), search);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.productsService.findById(id, scopeOf(req.user));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto, @Req() req: RequestWithUser) {
    return this.productsService.update(id, dto, scopeOf(req.user));
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.productsService.remove(id, scopeOf(req.user));
  }
}
