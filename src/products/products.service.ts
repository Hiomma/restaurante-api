import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema.js';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto.js';

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

  async findAll(ownerId: string, search?: string): Promise<ProductDocument[]> {
    const filter: any = { owner: new Types.ObjectId(ownerId) };
    if (search) filter.name = { $regex: search, $options: 'i' };
    return this.productModel.find(filter).sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDocument> {
    const product = await this.productModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async remove(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Product not found');
  }
}
