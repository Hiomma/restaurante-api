import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AgendaItem, AgendaItemDocument } from '../schemas/agenda-item.schema.js';
import { CreateAgendaItemDto, UpdateAgendaItemDto } from '../dto/agenda-item.dto.js';
import { Scope, ownerFilter, idFilter } from '../types/scope.js';

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

  async findAll(scope: Scope): Promise<AgendaItemDocument[]> {
    return this.agendaItemModel
      .find(ownerFilter(scope))
      .sort({ datePerformed: -1 })
      .exec();
  }

  async findById(id: string, scope: Scope): Promise<AgendaItemDocument> {
    const item = await this.agendaItemModel.findOne(idFilter(id, scope)).exec();
    if (!item) throw new NotFoundException('Agenda item not found');
    return item;
  }

  async update(id: string, dto: UpdateAgendaItemDto, scope: Scope): Promise<AgendaItemDocument> {
    const item = await this.agendaItemModel
      .findOneAndUpdate(idFilter(id, scope), dto, { new: true })
      .exec();
    if (!item) throw new NotFoundException('Agenda item not found');
    return item;
  }

  async remove(id: string, scope: Scope): Promise<void> {
    const result = await this.agendaItemModel.findOneAndDelete(idFilter(id, scope)).exec();
    if (!result) throw new NotFoundException('Agenda item not found');
  }
}
