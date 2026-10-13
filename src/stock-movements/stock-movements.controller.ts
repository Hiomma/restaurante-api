import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StockMovementsService } from './stock-movements.service.js';
import { CreateStockMovementDto, UpdateStockMovementDto } from '../dto/stock-movement.dto.js';
import { UsersService } from '../users/users.service.js';
import { EmployeesService } from '../employees/employees.service.js';
import { RequestWithUser } from '../types/request-with-user.js';
import { scopeOf } from '../types/scope.js';

@UseGuards(AuthGuard('jwt'))
@Controller('stock-movements')
export class StockMovementsController {
  constructor(
    private stockMovementsService: StockMovementsService,
    private usersService: UsersService,
    private employeesService: EmployeesService,
  ) {}

  /**
   * Quem fez a movimentação fica registrado junto com ela. O nome vem do
   * token; para tokens antigos (emitidos antes do nome entrar no JWT) o
   * usuário/funcionário é consultado no banco como fallback.
   */
  private async actorNameOf(user: RequestWithUser['user']): Promise<string> {
    if (user.name) return user.name;
    try {
      if (user.employeeId) {
        const employee = await this.employeesService.findById(user.employeeId, scopeOf(user));
        if (employee?.name) return employee.name;
      }
      const account = await this.usersService.findById(user.userId);
      if (account?.name) return account.name;
    } catch {
      // fallback silencioso: cai para o username abaixo
    }
    return user.username;
  }

  @Post()
  async create(@Body() dto: CreateStockMovementDto, @Req() req: RequestWithUser) {
    const userName = await this.actorNameOf(req.user);
    return this.stockMovementsService.create({ ...dto, userName }, req.user.userId);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.stockMovementsService.findAll(scopeOf(req.user));
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.stockMovementsService.findById(id, scopeOf(req.user));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStockMovementDto, @Req() req: RequestWithUser) {
    return this.stockMovementsService.update(id, dto, scopeOf(req.user));
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.stockMovementsService.remove(id, scopeOf(req.user));
  }
}
