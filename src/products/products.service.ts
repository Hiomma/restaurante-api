import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductSchema } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<Product>) {}

  create(data: Partial<Product>) {
    return this.productModel.create(data);
  }

  findAll() {
    return this.productModel.find({}).lean().exec();
  }

  findOne(id: string) {
    return this.productModel.findById(id).lean().exec();
  }

  update(id: string, data: Partial<Product>) {
    return this.productModel.findByIdAndUpdate(id, data, { new: true }).lean().exec();
  }

  remove(id: string) {
    return this.productModel.findByIdAndDelete(id).lean().exec();
  }
}
