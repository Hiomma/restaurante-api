import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class StockMovement extends Document {
  @Prop({ required: true, type: String })
  productId: string;

  @Prop({ required: true, enum: ['entrada','saida','ajuste','transferencia'], type: String })
  tipo: string;

  @Prop({ required: true, min: 0 })
  quantidade: number;

  @Prop({ required: true, type: String })
  motivo: string;

  @Prop({ type: String })
  destino: string;

  @Prop({ type: String })
  responsavelId: string;

  @Prop({ default: false })
  sincronizado: boolean;
}

export const StockMovementSchema = SchemaFactory.createForClass(StockMovement);
