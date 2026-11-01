import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Group, GroupDocument } from '../schemas/group.schema.js';
import { CreateGroupDto, UpdateGroupDto } from '../dto/group.dto.js';
import { Scope, ownerFilter, idFilter } from '../types/scope.js';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name)
    private groupModel: Model<GroupDocument>,
  ) {}

  async create(dto: CreateGroupDto, ownerId: string): Promise<GroupDocument> {
    const group = new this.groupModel({
      ...dto,
      owner: new Types.ObjectId(ownerId),
    });
    return group.save();
  }

  async findAll(scope: Scope): Promise<GroupDocument[]> {
    return this.groupModel
      .find(ownerFilter(scope))
      .sort({ name: 1 })
      .exec();
  }

  async findById(id: string, scope: Scope): Promise<GroupDocument> {
    const group = await this.groupModel.findOne(idFilter(id, scope)).exec();
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  async update(id: string, dto: UpdateGroupDto, scope: Scope): Promise<GroupDocument> {
    const group = await this.groupModel
      .findOneAndUpdate(idFilter(id, scope), dto, { new: true })
      .exec();
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  async remove(id: string, scope: Scope): Promise<void> {
    const result = await this.groupModel.findOneAndDelete(idFilter(id, scope)).exec();
    if (!result) throw new NotFoundException('Group not found');
  }
}
