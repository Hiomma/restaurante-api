import { Controller, Get, Put, Post, Body, Param, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service.js';
import { EmployeesService } from '../employees/employees.service.js';
import { UpdateUserDto, ChangePasswordDto, ResetPasswordDto } from '../dto/user.dto.js';
import { RequestWithUser } from '../types/request-with-user.js';
import { scopeOf } from '../types/scope.js';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private employeesService: EmployeesService,
  ) {}

  @Get('me')
  async getMe(@Req() req: RequestWithUser) {
    if (req.user.employeeId) {
      const employee = await this.employeesService.findById(
        req.user.employeeId,
        scopeOf(req.user),
      );
      return {
        _id: employee._id,
        name: employee.name,
        username: employee.username,
        role: employee.role,
        isEmployee: true,
      };
    }
    return this.usersService.findById(req.user.userId);
  }

  @Put('me')
  async updateMe(@Req() req: RequestWithUser, @Body() dto: UpdateUserDto) {
    if (req.user.employeeId) {
      return this.employeesService.update(
        req.user.employeeId,
        { name: dto.name },
        scopeOf(req.user),
      );
    }
    return this.usersService.update(req.user.userId, dto, scopeOf(req.user));
  }

  @Put('me/password')
  async changeMyPassword(
    @Req() req: RequestWithUser,
    @Body() dto: ChangePasswordDto,
  ) {
    if (req.user.employeeId) {
      await this.employeesService.changeOwnPassword(
        req.user.employeeId,
        dto.currentPassword,
        dto.newPassword,
      );
    } else {
      await this.usersService.changePassword(
        req.user.userId,
        dto.currentPassword,
        dto.newPassword,
      );
    }
    return { success: true };
  }

  @Put(':id/password')
  async resetUserPassword(
    @Param('id') id: string,
    @Body() dto: ResetPasswordDto,
    @Req() req: RequestWithUser,
  ) {
    const scope = scopeOf(req.user);
    if (!scope.admin) throw new NotFoundException('User not found');
    await this.usersService.resetPassword(id, dto.newPassword);
    return { success: true };
  }

  @Get()
  async findAll(@Req() req: RequestWithUser) {
    return this.usersService.findAll(scopeOf(req.user));
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    const user = await this.usersService.findByIdScoped(id, scopeOf(req.user));
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
