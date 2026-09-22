import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StockMovement, StockMovementSchema } from '../schemas/stock-movement.schema.js';
import { StockMovementsService } from './stock-movements.service.js';
import { StockMovementsController } from './stock-movements.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: StockMovement.name, schema: StockMovementSchema }]),
  ],
  controllers: [StockMovementsController],
  providers: [StockMovementsService],
  exports: [StockMovementsService],
})
export class StockMovementsModule {}
