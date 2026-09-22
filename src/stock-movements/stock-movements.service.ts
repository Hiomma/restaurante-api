import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StockMovement, StockMovementDocument } from '../schemas/stock-movement.schema.js';
import { CreateStockMovementDto, UpdateStockMovementDto } from '../dto/stock-movement.dto.js';

@Injectable()
export class StockMovementsService {
  constructor(
    @InjectModel(StockMovement.name)
    private stockMovementModel: Model<StockMovementDocument>,
  ) {}

  async create(dto: CreateStockMovementDto, ownerId: string): Promise<StockMovementDocument> {
    const movement = new this.stockMovementModel({
      product: {
        productId: dto.productId,
        productName: dto.productName,
      },
      movementType: dto.movementType,
      quantity: dto.quantity,
      weightGrams: dto.weightGrams,
      itemType: dto.itemType,
      reason: dto.reason,
      date: dto.date,
      owner: new Types.ObjectId(ownerId),
    });
    return movement.save();
  }

  async findAll(ownerId: string): Promise<StockMovementDocument[]> {
    return this.stockMovementModel
      .find({ owner: new Types.ObjectId(ownerId) })
      .sort({ date: -1 })
      .exec();
  }

  async findById(id: string): Promise<StockMovementDocument> {
    const movement = await this.stockMovementModel.findById(id).exec();
    if (!movement) throw new NotFoundException('Stock movement not found');
    return movement;
  }

  async update(id: string, dto: UpdateStockMovementDto): Promise<StockMovementDocument> {
    const movement = await this.stockMovementModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!movement) throw new NotFoundException('Stock movement not found');
    return movement;
  }

  async remove(id: string): Promise<void> {
    const result = await this.stockMovementModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Stock movement not found');
  }
}
