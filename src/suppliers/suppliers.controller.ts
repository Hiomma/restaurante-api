import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SuppliersService } from './suppliers.service.js';
import { CreateSupplierDto, UpdateSupplierDto } from '../dto/supplier.dto.js';
import { RequestWithUser } from '../types/request-with-user.js';
import { scopeOf } from '../types/scope.js';
import { EmployeeRestrictionsGuard } from '../common/employee-restrictions.guard.js';
import { RestrictEmployee } from '../common/restrict-employee.decorator.js';

@UseGuards(AuthGuard('jwt'), EmployeeRestrictionsGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Post()
  @RestrictEmployee()
  create(@Body() dto: CreateSupplierDto, @Req() req: RequestWithUser) {
    return this.suppliersService.create(dto, req.user.userId);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.suppliersService.findAll(scopeOf(req.user));
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.suppliersService.findById(id, scopeOf(req.user));
  }

  @Put(':id')
  @RestrictEmployee()
  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto, @Req() req: RequestWithUser) {
    return this.suppliersService.update(id, dto, scopeOf(req.user));
  }

  @Delete(':id')
  @RestrictEmployee()
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.suppliersService.remove(id, scopeOf(req.user));
  }
}
