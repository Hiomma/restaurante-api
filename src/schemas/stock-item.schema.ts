import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ _id: false })
export class StockItemProductSnapshot {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  productName: string;

  @Prop()
  productGroup: string;

  @Prop()
  productStorage: string;
}

export const StockItemProductSnapshotSchema = SchemaFactory.createForClass(StockItemProductSnapshot);

@Schema({ timestamps: true })
export class StockItem {
  @Prop({ type: StockItemProductSnapshotSchema, required: true })
  product: StockItemProductSnapshot;

  @Prop({ required: true, enum: ['raw', 'portioned'] })
  type: string;

  @Prop({ required: true })
  weightGrams: number;

  @Prop({ required: true })
  manipulationDate: Date;

  @Prop({ required: true })
  expiryDate: Date;

  @Prop()
  originalExpiryDate: Date;

  @Prop({ unique: true })
  qrCode: string;

  @Prop({ default: 'in_stock', enum: ['in_stock', 'used', 'discarded', 'expired'] })
  status: string;

  @Prop()
  batchId: string;

  @Prop()
  lote: string;

  @Prop()
  nf: string;

  @Prop()
  employeeName: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;
}

export type StockItemDocument = HydratedDocument<StockItem>;
export const StockItemSchema = SchemaFactory.createForClass(StockItem);
