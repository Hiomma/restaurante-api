import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MovementDestination, MovementDestinationDocument } from '../schemas/movement-destination.schema.js';
import { CreateMovementDestinationDto, UpdateMovementDestinationDto } from '../dto/movement-destination.dto.js';

@Injectable()
export class MovementDestinationsService {
  constructor(
    @InjectModel(MovementDestination.name)
    private destinationModel: Model<MovementDestinationDocument>,
  ) {}

  async create(dto: CreateMovementDestinationDto, ownerId: string): Promise<MovementDestinationDocument> {
    const dest = new this.destinationModel({
      ...dto,
      owner: new Types.ObjectId(ownerId),
    });
    return dest.save();
  }

  async findAll(ownerId: string): Promise<MovementDestinationDocument[]> {
    return this.destinationModel
      .find({ owner: new Types.ObjectId(ownerId) })
      .sort({ name: 1 })
      .exec();
  }

  async findById(id: string): Promise<MovementDestinationDocument> {
    const dest = await this.destinationModel.findById(id).exec();
    if (!dest) throw new NotFoundException('Movement destination not found');
    return dest;
  }

  async update(id: string, dto: UpdateMovementDestinationDto): Promise<MovementDestinationDocument> {
    const dest = await this.destinationModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!dest) throw new NotFoundException('Movement destination not found');
    return dest;
  }

  async remove(id: string): Promise<void> {
    const result = await this.destinationModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Movement destination not found');
  }
}
