import { Controller, Get, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service.js';
import { UpdateUserDto } from '../dto/user.dto.js';
import { RequestWithUser } from '../types/request-with-user.js';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getMe(@Req() req: RequestWithUser) {
    return this.usersService.findById(req.user.userId);
  }

  @Put('me')
  async updateMe(@Req() req: RequestWithUser, @Body() dto: UpdateUserDto) {
    return this.usersService.update(req.user.userId, dto);
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
