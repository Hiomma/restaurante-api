import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GroupsService } from './groups.service.js';
import { CreateGroupDto, UpdateGroupDto } from '../dto/group.dto.js';
import { RequestWithUser } from '../types/request-with-user.js';
import { scopeOf } from '../types/scope.js';
import { EmployeeRestrictionsGuard } from '../common/employee-restrictions.guard.js';
import { RestrictEmployee } from '../common/restrict-employee.decorator.js';

@UseGuards(AuthGuard('jwt'), EmployeeRestrictionsGuard)
@Controller('groups')
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

  @Post()
  @RestrictEmployee()
  create(@Body() dto: CreateGroupDto, @Req() req: RequestWithUser) {
    return this.groupsService.create(dto, req.user.userId);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.groupsService.findAll(scopeOf(req.user));
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.groupsService.findById(id, scopeOf(req.user));
  }

  @Put(':id')
  @RestrictEmployee()
  update(@Param('id') id: string, @Body() dto: UpdateGroupDto, @Req() req: RequestWithUser) {
    return this.groupsService.update(id, dto, scopeOf(req.user));
  }

  @Delete(':id')
  @RestrictEmployee()
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.groupsService.remove(id, scopeOf(req.user));
  }
}
