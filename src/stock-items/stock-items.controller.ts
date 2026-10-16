import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StockItemsService } from './stock-items.service.js';
import { CreateStockItemDto, UpdateStockItemDto, StockItemQueryDto } from '../dto/stock-item.dto.js';
import { UsersService } from '../users/users.service.js';
import { EmployeesService } from '../employees/employees.service.js';
import { RequestWithUser } from '../types/request-with-user.js';
import { scopeOf } from '../types/scope.js';
import { EmployeeRestrictionsGuard } from '../common/employee-restrictions.guard.js';

@UseGuards(AuthGuard('jwt'), EmployeeRestrictionsGuard)
@Controller('stock-items')
export class StockItemsController {
  constructor(
    private stockItemsService: StockItemsService,
    private usersService: UsersService,
    private employeesService: EmployeesService,
  ) {}

  /**
   * Quem baixou a etiqueta fica registrado no tombstone. O nome vem do
   * token; para tokens antigos (emitidos antes do nome entrar no JWT) o
   * usuário/funcionário é consultado no banco como fallback. Mesmo padrão
   * de StockMovementsController.actorNameOf.
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
  async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userName = await this.actorNameOf(req.user);
    return this.stockItemsService.remove(id, scopeOf(req.user), userName);
  }
}
