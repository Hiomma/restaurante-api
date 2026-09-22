import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Portioning, PortioningDocument } from '../schemas/portioning.schema.js';
import { CreatePortioningDto, UpdatePortioningDto } from '../dto/portioning.dto.js';

@Injectable()
export class PortioningsService {
  constructor(
    @InjectModel(Portioning.name)
    private portioningModel: Model<PortioningDocument>,
  ) {}

  async create(dto: CreatePortioningDto, ownerId: string): Promise<PortioningDocument> {
    const lossPercentage = dto.rawWeightGrams > 0
      ? (dto.lossGrams / dto.rawWeightGrams) * 100
      : 0;
    const portionsCount = dto.portionsCount || 0;
    const portionWeightGrams = portionsCount > 0
      ? dto.cleanWeightGrams / portionsCount
      : 0;

    const portioning = new this.portioningModel({
      product: {
        productId: dto.productId,
        productName: dto.productName,
      },
      rawWeightGrams: dto.rawWeightGrams,
      cleanWeightGrams: dto.cleanWeightGrams,
      lossGrams: dto.lossGrams,
      lossPercentage,
      portionsCount: dto.portionsCount,
      portionWeightGrams,
      date: dto.date,
      lote: dto.lote,
      employeeName: dto.employeeName,
      owner: new Types.ObjectId(ownerId),
    });
    return portioning.save();
  }

  async findAll(ownerId: string): Promise<PortioningDocument[]> {
    return this.portioningModel
      .find({ owner: new Types.ObjectId(ownerId) })
      .sort({ date: -1 })
      .exec();
  }

  async findById(id: string): Promise<PortioningDocument> {
    const portioning = await this.portioningModel.findById(id).exec();
    if (!portioning) throw new NotFoundException('Portioning not found');
    return portioning;
  }

  async update(id: string, dto: UpdatePortioningDto): Promise<PortioningDocument> {
    const portioning = await this.portioningModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!portioning) throw new NotFoundException('Portioning not found');
    return portioning;
  }

  async remove(id: string): Promise<void> {
    const result = await this.portioningModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Portioning not found');
  }
}
