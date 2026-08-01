import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {
  stockSummary() {
    return { message: 'Stock summary report' };
  }

  movementsReport() {
    return { message: 'Movements report' };
  }
}
