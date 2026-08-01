import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StockItem, StockItemSchema } from './schemas/stock-item.schema';

@Injectable()
export class StockService {
  constructor(@InjectModel(StockItem.name) private stockModel: Model<StockItem>) {}

  create(data: Partial<StockItem>) {
    return this.stockModel.create(data);
  }

  findAll() {
    return this.stockModel.find({}).lean().exec();
  }

  findOne(id: string) {
    return this.stockModel.findById(id).lean().exec();
  }

  update(id: string, data: Partial<StockItem>) {
    return this.stockModel.findByIdAndUpdate(id, data, { new: true }).lean().exec();
  }

  remove(id: string) {
    return this.stockModel.findByIdAndDelete(id).lean().exec();
  }
}
