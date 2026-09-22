import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmployeesService } from './employees.service.js';
import { CreateEmployeeDto, UpdateEmployeeDto } from '../dto/employee.dto.js';
import { RequestWithUser } from '../types/request-with-user.js';

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
    return this.employeesService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employeesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }
}
