import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AgendaItemDocument = HydratedDocument<AgendaItem>;

@Schema({ timestamps: true })
export class AgendaItem {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  datePerformed: Date;

  @Prop({ required: true })
  expiryDate: Date;

  @Prop()
  observations: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;
}

export const AgendaItemSchema = SchemaFactory.createForClass(AgendaItem);
