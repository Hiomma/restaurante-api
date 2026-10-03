import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmployeesService } from './employees.service.js';
import { CreateEmployeeDto, UpdateEmployeeDto } from '../dto/employee.dto.js';
import { RequestWithUser } from '../types/request-with-user.js';
import { scopeOf } from '../types/scope.js';

@UseGuards(AuthGuard('jwt'))
@Controller('employees')
export class EmployeesController {
  constructor(private employeesService: EmployeesService) {}

  @Post()
  create(@Body() dto: CreateEmployeeDto, @Req() req: RequestWithUser) {
    return this.employeesService.create(dto, req.user.userId);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.employeesService.findAll(scopeOf(req.user));
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.employeesService.findById(id, scopeOf(req.user));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto, @Req() req: RequestWithUser) {
    return this.employeesService.update(id, dto, scopeOf(req.user));
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.employeesService.remove(id, scopeOf(req.user));
  }
}
