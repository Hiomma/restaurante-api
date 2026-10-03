import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StockMovement, StockMovementDocument } from '../schemas/stock-movement.schema.js';
import { CreateStockMovementDto, UpdateStockMovementDto } from '../dto/stock-movement.dto.js';
import { Scope, ownerFilter, idFilter } from '../types/scope.js';

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

  async findAll(scope: Scope): Promise<StockMovementDocument[]> {
    return this.stockMovementModel
      .find(ownerFilter(scope))
      .sort({ date: -1 })
      .exec();
  }

  async findById(id: string, scope: Scope): Promise<StockMovementDocument> {
    const movement = await this.stockMovementModel.findOne(idFilter(id, scope)).exec();
    if (!movement) throw new NotFoundException('Stock movement not found');
    return movement;
  }

  async update(id: string, dto: UpdateStockMovementDto, scope: Scope): Promise<StockMovementDocument> {
    const movement = await this.stockMovementModel
      .findOneAndUpdate(idFilter(id, scope), dto, { new: true })
      .exec();
    if (!movement) throw new NotFoundException('Stock movement not found');
    return movement;
  }

  async remove(id: string, scope: Scope): Promise<void> {
    const result = await this.stockMovementModel.findOneAndDelete(idFilter(id, scope)).exec();
    if (!result) throw new NotFoundException('Stock movement not found');
  }
}
