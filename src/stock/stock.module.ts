import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StockItemSchema } from './schemas/stock-item.schema';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'StockItem', schema: StockItemSchema }])],
  providers: [StockService],
  controllers: [StockController],
  exports: [StockService],
})
export class StockModule {}
