import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ _id: false })
export class StockMovementProductSnapshot {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  productName: string;
}

export const StockMovementProductSnapshotSchema = SchemaFactory.createForClass(StockMovementProductSnapshot);

@Schema({ timestamps: true })
export class StockMovement {
  @Prop({ type: StockMovementProductSnapshotSchema, required: true })
  product: StockMovementProductSnapshot;

  @Prop({ required: true, enum: ['entry', 'exit'] })
  movementType: string;

  @Prop({ required: true })
  quantity: number;

  @Prop()
  weightGrams: number;

  @Prop({ enum: ['raw', 'portioned'] })
  itemType: string;

  @Prop()
  reason: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;
}

export type StockMovementDocument = HydratedDocument<StockMovement>;
export const StockMovementSchema = SchemaFactory.createForClass(StockMovement);
