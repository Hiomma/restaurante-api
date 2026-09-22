import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AgendaItem, AgendaItemDocument } from '../schemas/agenda-item.schema.js';
import { CreateAgendaItemDto, UpdateAgendaItemDto } from '../dto/agenda-item.dto.js';

@Injectable()
export class AgendaItemsService {
  constructor(
    @InjectModel(AgendaItem.name)
    private agendaItemModel: Model<AgendaItemDocument>,
  ) {}

  async create(dto: CreateAgendaItemDto, ownerId: string): Promise<AgendaItemDocument> {
    const item = new this.agendaItemModel({
      ...dto,
      owner: new Types.ObjectId(ownerId),
    });
    return item.save();
  }

  async findAll(ownerId: string): Promise<AgendaItemDocument[]> {
    return this.agendaItemModel
      .find({ owner: new Types.ObjectId(ownerId) })
      .sort({ datePerformed: -1 })
      .exec();
  }

  async findById(id: string): Promise<AgendaItemDocument> {
    const item = await this.agendaItemModel.findById(id).exec();
    if (!item) throw new NotFoundException('Agenda item not found');
    return item;
  }

  async update(id: string, dto: UpdateAgendaItemDto): Promise<AgendaItemDocument> {
    const item = await this.agendaItemModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!item) throw new NotFoundException('Agenda item not found');
    return item;
  }

  async remove(id: string): Promise<void> {
    const result = await this.agendaItemModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Agenda item not found');
  }
}
