import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AgendaItem, AgendaItemSchema } from './schemas/agenda-item.schema';

@Injectable()
export class AgendaService {
  constructor(@InjectModel(AgendaItem.name) private agendaModel: Model<AgendaItem>) {}

  create(data: Partial<AgendaItem>) {
    return this.agendaModel.create(data);
  }

  findAll() {
    return this.agendaModel.find({}).lean().exec();
  }

  findOne(id: string) {
    return this.agendaModel.findById(id).lean().exec();
  }

  update(id: string, data: Partial<AgendaItem>) {
    return this.agendaModel.findByIdAndUpdate(id, data, { new: true }).lean().exec();
  }

  remove(id: string) {
    return this.agendaModel.findByIdAndDelete(id).lean().exec();
  }
}
