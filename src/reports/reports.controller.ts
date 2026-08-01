import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  @Get('stock')
  stockSummary() {
    return { message: 'Stock summary report endpoint' };
  }

  @Get('movements')
  movementsReport() {
    return { message: 'Movements report endpoint' };
  }
}
