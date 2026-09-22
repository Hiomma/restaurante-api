import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StockItem, StockItemDocument } from '../schemas/stock-item.schema.js';
import { CreateStockItemDto, UpdateStockItemDto, StockItemQueryDto } from '../dto/stock-item.dto.js';

function generateQrCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

@Injectable()
export class StockItemsService {
  constructor(
    @InjectModel(StockItem.name)
    private stockItemModel: Model<StockItemDocument>,
  ) {}

  async create(dto: CreateStockItemDto, ownerId: string): Promise<StockItemDocument> {
    const item = new this.stockItemModel({
      product: {
        productId: dto.productId,
        productName: dto.productName,
        productGroup: dto.productGroup,
        productStorage: dto.productStorage,
      },
      type: dto.type,
      weightGrams: dto.weightGrams,
      manipulationDate: dto.manipulationDate,
      expiryDate: dto.expiryDate,
      originalExpiryDate: dto.originalExpiryDate,
      qrCode: generateQrCode(),
      lote: dto.lote,
      nf: dto.nf,
      employeeName: dto.employeeName,
      status: 'in_stock',
      owner: new Types.ObjectId(ownerId),
    });
    return item.save();
  }

  async findAll(ownerId: string, query: StockItemQueryDto): Promise<StockItemDocument[]> {
    const filter: any = { owner: new Types.ObjectId(ownerId) };
    if (query.status) filter.status = query.status;
    if (query.productId) filter['product.productId'] = query.productId;
    if (query.type) filter.type = query.type;
    return this.stockItemModel.find(filter).sort({ expiryDate: 1 }).exec();
  }

  async findById(id: string): Promise<StockItemDocument> {
    const item = await this.stockItemModel.findById(id).exec();
    if (!item) throw new NotFoundException('Stock item not found');
    return item;
  }

  async findByQrCode(qrCode: string): Promise<StockItemDocument> {
    const item = await this.stockItemModel.findOne({ qrCode }).exec();
    if (!item) throw new NotFoundException('Stock item not found');
    return item;
  }

  async update(id: string, dto: UpdateStockItemDto): Promise<StockItemDocument> {
    const item = await this.stockItemModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!item) throw new NotFoundException('Stock item not found');
    return item;
  }

  async remove(id: string): Promise<void> {
    const result = await this.stockItemModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Stock item not found');
  }

  async getLowStock(ownerId: string): Promise<StockItemDocument[]> {
    return this.stockItemModel
      .find({
        owner: new Types.ObjectId(ownerId),
        status: 'in_stock',
      })
      .sort({ expiryDate: 1 })
      .exec();
  }
}
