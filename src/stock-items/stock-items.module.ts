import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StockItem, StockItemSchema } from '../schemas/stock-item.schema.js';
import { StockItemsService } from './stock-items.service.js';
import { StockItemsController } from './stock-items.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: StockItem.name, schema: StockItemSchema }]),
  ],
  controllers: [StockItemsController],
  providers: [StockItemsService],
  exports: [StockItemsService],
})
export class StockItemsModule {}
