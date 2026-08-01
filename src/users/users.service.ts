import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserSchema } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(data: Partial<User>) {
    const hashed = await bcrypt.hash(data.password as string, 10);
    const user = await this.userModel.create({ ...data, password: hashed });
    return this.sanitize(user);
  }

  async findAll() {
    const users = await this.userModel.find({}).lean().exec();
    return users.map(u => this.sanitize(u));
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).lean().exec();
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return this.sanitize(user);
  }

  async update(id: string, data: Partial<User>) {
    const user = await this.userModel.findByIdAndUpdate(id, data, { new: true }).lean().exec();
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return this.sanitize(user);
  }

  async remove(id: string) {
    const user = await this.userModel.findByIdAndDelete(id).lean().exec();
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return { deleted: true };
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async comparePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  private sanitize(user: any) {
    if (!user) return user;
    const { password, ...rest } = user;
    return rest;
  }
}
