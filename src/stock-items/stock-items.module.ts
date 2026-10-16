import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StockItem, StockItemSchema } from '../schemas/stock-item.schema.js';
import { StockItemRemoval, StockItemRemovalSchema } from '../schemas/stock-item-removal.schema.js';
import { StockItemsService } from './stock-items.service.js';
import { StockItemsController } from './stock-items.controller.js';
import { UsersModule } from '../users/users.module.js';
import { EmployeesModule } from '../employees/employees.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StockItem.name, schema: StockItemSchema },
      { name: StockItemRemoval.name, schema: StockItemRemovalSchema },
    ]),
    UsersModule,
    EmployeesModule,
  ],
  controllers: [StockItemsController],
  providers: [StockItemsService],
  exports: [StockItemsService],
})
export class StockItemsModule {}
