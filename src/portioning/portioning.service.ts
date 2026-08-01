import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Portioning, PortioningSchema } from './schemas/portioning.schema';

@Injectable()
export class PortioningService {
  constructor(@InjectModel(Portioning.name) private portioningModel: Model<Portioning>) {}

  create(data: Partial<Portioning>) {
    return this.portioningModel.create(data);
  }

  findAll() {
    return this.portioningModel.find({}).lean().exec();
  }

  findOne(id: string) {
    return this.portioningModel.findById(id).lean().exec();
  }

  update(id: string, data: Partial<Portioning>) {
    return this.portioningModel.findByIdAndUpdate(id, data, { new: true }).lean().exec();
  }

  remove(id: string) {
    return this.portioningModel.findByIdAndDelete(id).lean().exec();
  }
}
