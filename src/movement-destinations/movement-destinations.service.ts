import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MovementDestination, MovementDestinationDocument } from '../schemas/movement-destination.schema.js';
import { CreateMovementDestinationDto, UpdateMovementDestinationDto } from '../dto/movement-destination.dto.js';
import { Scope, ownerFilter, idFilter } from '../types/scope.js';

@Injectable()
export class MovementDestinationsService {
  constructor(
    @InjectModel(MovementDestination.name)
    private destinationModel: Model<MovementDestinationDocument>,
  ) {}

  async create(dto: CreateMovementDestinationDto, ownerId: string): Promise<MovementDestinationDocument> {
    const dest = new this.destinationModel({
      ...dto,
      type: dto.type || 'move',
      owner: new Types.ObjectId(ownerId),
    });
    return dest.save();
  }

  async findAll(scope: Scope): Promise<MovementDestinationDocument[]> {
    return this.destinationModel
      .find(ownerFilter(scope))
      .sort({ name: 1 })
      .exec();
  }

  async findById(id: string, scope: Scope): Promise<MovementDestinationDocument> {
    const dest = await this.destinationModel.findOne(idFilter(id, scope)).exec();
    if (!dest) throw new NotFoundException('Movement destination not found');
    return dest;
  }

  async update(id: string, dto: UpdateMovementDestinationDto, scope: Scope): Promise<MovementDestinationDocument> {
    const dest = await this.destinationModel
      .findOneAndUpdate(idFilter(id, scope), dto, { new: true })
      .exec();
    if (!dest) throw new NotFoundException('Movement destination not found');
    return dest;
  }

  async remove(id: string, scope: Scope): Promise<void> {
    const result = await this.destinationModel.findOneAndDelete(idFilter(id, scope)).exec();
    if (!result) throw new NotFoundException('Movement destination not found');
  }
}
