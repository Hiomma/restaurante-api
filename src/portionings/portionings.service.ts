import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Portioning, PortioningDocument } from '../schemas/portioning.schema.js';
import { CreatePortioningDto, UpdatePortioningDto } from '../dto/portioning.dto.js';
import { Scope, ownerFilter, idFilter } from '../types/scope.js';

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

    const validOutputs = (dto.outputs || []).filter(
      (o) => o.productId && o.portionsCount > 0,
    );

    let portionsCount = dto.portionsCount || 0;
    let portionWeightGrams = portionsCount > 0
      ? Math.round(dto.cleanWeightGrams / portionsCount)
      : 0;
    let outputs: any[] = [];

    if (validOutputs.length > 0) {
      portionsCount = validOutputs.reduce((sum, o) => sum + o.portionsCount, 0);
      portionWeightGrams = portionsCount > 0
        ? Math.round(dto.cleanWeightGrams / portionsCount)
        : 0;
      outputs = validOutputs.map((o) => ({
        productId: o.productId,
        productName: o.productName,
        portionsCount: o.portionsCount,
        portionWeightGrams,
      }));
    }

    const primaryProduct = outputs.length > 0
      ? { productId: outputs[0].productId, productName: outputs[0].productName }
      : { productId: dto.productId, productName: dto.productName };

    const portioning = new this.portioningModel({
      product: primaryProduct,
      outputs,
      rawWeightGrams: dto.rawWeightGrams,
      cleanWeightGrams: dto.cleanWeightGrams,
      lossGrams: dto.lossGrams,
      lossPercentage,
      portionsCount,
      portionWeightGrams,
      date: dto.date,
      lote: dto.lote,
      employeeName: dto.employeeName,
      owner: new Types.ObjectId(ownerId),
    });
    return portioning.save();
  }

  async findAll(scope: Scope): Promise<PortioningDocument[]> {
    return this.portioningModel
      .find(ownerFilter(scope))
      .sort({ date: -1 })
      .exec();
  }

  async findById(id: string, scope: Scope): Promise<PortioningDocument> {
    const portioning = await this.portioningModel.findOne(idFilter(id, scope)).exec();
    if (!portioning) throw new NotFoundException('Portioning not found');
    return portioning;
  }

  async update(id: string, dto: UpdatePortioningDto, scope: Scope): Promise<PortioningDocument> {
    const portioning = await this.portioningModel
      .findOneAndUpdate(idFilter(id, scope), dto, { new: true })
      .exec();
    if (!portioning) throw new NotFoundException('Portioning not found');
    return portioning;
  }

  async remove(id: string, scope: Scope): Promise<void> {
    const result = await this.portioningModel.findOneAndDelete(idFilter(id, scope)).exec();
    if (!result) throw new NotFoundException('Portioning not found');
  }
}
