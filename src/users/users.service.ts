import { Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema.js';
import { UpdateUserDto } from '../dto/user.dto.js';
import { Scope, idFilter } from '../types/scope.js';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('-password').exec();
  }

  async findByIdScoped(id: string, scope: Scope): Promise<UserDocument | null> {
    return this.userModel.findOne(idFilter(id, scope)).select('-password').exec();
  }

  async create(data: Partial<User>): Promise<UserDocument> {
    const existing = await this.userModel
      .findOne({ username: data.username })
      .exec();
    if (existing) throw new ConflictException('Username already exists');
    const user = new this.userModel(data);
    return user.save();
  }

  async update(id: string, dto: UpdateUserDto, scope: Scope): Promise<UserDocument | null> {
    return this.userModel
      .findOneAndUpdate(idFilter(id, scope), dto, { new: true })
      .select('-password')
      .exec();
  }

  async findAll(scope: Scope): Promise<UserDocument[]> {
    const filter: any = scope.admin ? {} : { _id: new Types.ObjectId(scope.ownerId) };
    return this.userModel.find(filter).select('-password').exec();
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) throw new UnauthorizedException('Current password is incorrect');

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
  }

  async resetPassword(id: string, newPassword: string): Promise<void> {
    const password = await bcrypt.hash(newPassword, 10);
    const result = await this.userModel
      .findByIdAndUpdate(id, { password }, { new: true })
      .exec();
    if (!result) throw new NotFoundException('User not found');
  }
}
