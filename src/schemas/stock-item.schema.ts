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

  @Prop()
  qrCode: string;

  @Prop({ default: 'in_stock', enum: ['in_stock', 'used', 'discarded', 'expired'] })
  status: string;

  @Prop()
  batchId: string;

  @Prop()
  destination: string;

  @Prop()
  lote: string;

  @Prop()
  nf: string;

  /** Nome do fornecedor de quem a mercadoria foi recebida (snapshot). */
  @Prop()
  supplier: string;

  @Prop()
  employeeName: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;
}

export type StockItemDocument = HydratedDocument<StockItem>;
export const StockItemSchema = SchemaFactory.createForClass(StockItem);

/**
 * Unicidade do QR por RESTAURANTE: dois restaurantes podem gerar o mesmo
 * código de 6 caracteres, mas dentro de um dono o código é único. O índice
 * global anterior (`qrCode_1`) é removido na inicialização (ver
 * StockItemsService.onModuleInit).
 */
StockItemSchema.index({ owner: 1, qrCode: 1 }, { unique: true });
