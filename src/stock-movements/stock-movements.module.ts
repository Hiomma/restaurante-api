import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StockMovement, StockMovementSchema } from '../schemas/stock-movement.schema.js';
import { StockMovementsService } from './stock-movements.service.js';
import { StockMovementsController } from './stock-movements.controller.js';
import { UsersModule } from '../users/users.module.js';
import { EmployeesModule } from '../employees/employees.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: StockMovement.name, schema: StockMovementSchema }]),
    UsersModule,
    EmployeesModule,
  ],
  controllers: [StockMovementsController],
  providers: [StockMovementsService],
  exports: [StockMovementsService],
})
export class StockMovementsModule {}
