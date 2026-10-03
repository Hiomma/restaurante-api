import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StockItem, StockItemDocument } from '../schemas/stock-item.schema.js';
import { CreateStockItemDto, UpdateStockItemDto, StockItemQueryDto } from '../dto/stock-item.dto.js';
import { Scope, ownerFilter, idFilter } from '../types/scope.js';

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
    let item: StockItemDocument | null = null;
    let attempts = 0;
    while (!item && attempts < 5) {
      attempts++;
      try {
        item = await new this.stockItemModel({
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
          batchId: dto.batchId,
          destination: dto.destination,
          status: 'in_stock',
          owner: new Types.ObjectId(ownerId),
        }).save();
      } catch (error: any) {
        if (error?.code === 11000 && attempts < 5) continue;
        throw error;
      }
    }
    if (!item) throw new ConflictException('Could not generate a unique QR code');
    return item;
  }

  async findAll(scope: Scope, query: StockItemQueryDto): Promise<StockItemDocument[]> {
    const filter: any = ownerFilter(scope);
    if (query.status) filter.status = query.status;
    if (query.productId) filter['product.productId'] = query.productId;
    if (query.type) filter.type = query.type;
    if (query.destination) filter.destination = query.destination;
    return this.stockItemModel.find(filter).sort({ expiryDate: 1 }).exec();
  }

  async findById(id: string, scope: Scope): Promise<StockItemDocument> {
    const item = await this.stockItemModel.findOne(idFilter(id, scope)).exec();
    if (!item) throw new NotFoundException('Stock item not found');
    return item;
  }

  async findByQrCode(qrCode: string, scope: Scope): Promise<StockItemDocument> {
    const item = await this.stockItemModel
      .findOne({ qrCode, ...ownerFilter(scope) })
      .exec();
    if (!item) throw new NotFoundException('Stock item not found');
    return item;
  }

  async update(id: string, dto: UpdateStockItemDto, scope: Scope): Promise<StockItemDocument> {
    const item = await this.stockItemModel
      .findOneAndUpdate(idFilter(id, scope), dto, { new: true })
      .exec();
    if (!item) throw new NotFoundException('Stock item not found');
    return item;
  }

  async remove(id: string, scope: Scope): Promise<void> {
    const result = await this.stockItemModel.findOneAndDelete(idFilter(id, scope)).exec();
    if (!result) throw new NotFoundException('Stock item not found');
  }

  async getLowStock(scope: Scope): Promise<StockItemDocument[]> {
    return this.stockItemModel
      .find({
        ...ownerFilter(scope),
        status: 'in_stock',
      })
      .sort({ expiryDate: 1 })
      .exec();
  }
}
