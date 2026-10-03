import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ _id: false })
export class PortioningProductSnapshot {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  productName: string;
}

export const PortioningProductSnapshotSchema = SchemaFactory.createForClass(PortioningProductSnapshot);

@Schema({ _id: false })
export class PortioningOutput {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  portionsCount: number;

  @Prop()
  portionWeightGrams: number;
}

export const PortioningOutputSchema = SchemaFactory.createForClass(PortioningOutput);

@Schema({ timestamps: true })
export class Portioning {
  @Prop({ type: PortioningProductSnapshotSchema, required: true })
  product: PortioningProductSnapshot;

  @Prop({ type: [PortioningOutputSchema], default: [] })
  outputs: PortioningOutput[];

  @Prop({ required: true })
  rawWeightGrams: number;

  @Prop({ required: true })
  cleanWeightGrams: number;

  @Prop({ required: true })
  lossGrams: number;

  @Prop()
  lossPercentage: number;

  @Prop()
  portionsCount: number;

  @Prop()
  portionWeightGrams: number;

  @Prop({ required: true })
  date: Date;

  @Prop()
  lote: string;

  @Prop()
  employeeName: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;
}

export type PortioningDocument = HydratedDocument<Portioning>;
export const PortioningSchema = SchemaFactory.createForClass(Portioning);
