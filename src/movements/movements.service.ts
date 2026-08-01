import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StockMovement, StockMovementSchema } from './schemas/stock-movement.schema';

@Injectable()
export class MovementsService {
  constructor(@InjectModel(StockMovement.name) private movementModel: Model<StockMovement>) {}

  create(data: Partial<StockMovement>) {
    return this.movementModel.create(data);
  }

  findAll() {
    return this.movementModel.find({}).lean().exec();
  }

  findOne(id: string) {
    return this.movementModel.findById(id).lean().exec();
  }

  update(id: string, data: Partial<StockMovement>) {
    return this.movementModel.findByIdAndUpdate(id, data, { new: true }).lean().exec();
  }

  remove(id: string) {
    return this.movementModel.findByIdAndDelete(id).lean().exec();
  }
}
