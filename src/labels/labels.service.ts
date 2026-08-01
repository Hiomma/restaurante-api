import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Label, LabelSchema } from './schemas/label.schema';

@Injectable()
export class LabelsService {
  constructor(@InjectModel(Label.name) private labelModel: Model<Label>) {}

  create(data: Partial<Label>) {
    return this.labelModel.create(data);
  }

  findAll() {
    return this.labelModel.find({}).lean().exec();
  }

  findOne(id: string) {
    return this.labelModel.findById(id).lean().exec();
  }

  update(id: string, data: Partial<Label>) {
    return this.labelModel.findByIdAndUpdate(id, data, { new: true }).lean().exec();
  }

  remove(id: string) {
    return this.labelModel.findByIdAndDelete(id).lean().exec();
  }
}
