import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema.js';
import { UpdateUserDto } from '../dto/user.dto.js';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('-password').exec();
  }

  async create(data: Partial<User>): Promise<UserDocument> {
    const user = new this.userModel(data);
    return user.save();
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(id, dto, { new: true })
      .select('-password')
      .exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-password').exec();
  }
}
