import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class StockItem extends Document {
  @Prop({ required: true, type: String })
  productId: string;

  @Prop({ required: true, min: 0, default: 0 })
  quantidade: number;

  @Prop({ default: 0 })
  quantidadeMinima: number;

  @Prop({ default: 0 })
  quantidadeMaxima: number;

  @Prop({ default: 'UN' })
  unidade: string;

  @Prop({ default: true })
  ativo: boolean;
}

export const StockItemSchema = SchemaFactory.createForClass(StockItem);
