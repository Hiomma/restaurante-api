import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema.js';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto.js';
import { Scope, ownerFilter, idFilter } from '../types/scope.js';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
  ) {}

  async create(dto: CreateProductDto, ownerId: string): Promise<ProductDocument> {
    const product = new this.productModel({
      ...dto,
      owner: new Types.ObjectId(ownerId),
    });
    return product.save();
  }

  async findAll(scope: Scope, search?: string): Promise<ProductDocument[]> {
    const filter: any = ownerFilter(scope);
    if (search) {
      const term = { $regex: escapeRegex(search), $options: 'i' };
      filter.$or = [{ name: term }, { group: term }, { category: term }];
    }
    return this.productModel.find(filter).sort({ name: 1 }).exec();
  }

  async findById(id: string, scope: Scope): Promise<ProductDocument> {
    const product = await this.productModel.findOne(idFilter(id, scope)).exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, dto: UpdateProductDto, scope: Scope): Promise<ProductDocument> {
    const product = await this.productModel
      .findOneAndUpdate(idFilter(id, scope), dto, { new: true })
      .exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async remove(id: string, scope: Scope): Promise<void> {
    const result = await this.productModel.findOneAndDelete(idFilter(id, scope)).exec();
    if (!result) throw new NotFoundException('Product not found');
  }
}
