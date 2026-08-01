import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Label extends Document {
  @Prop({ required: true, trim: true })
  nome: string;

  @Prop({ required: true, min: 0 })
  preco: number;

  @Prop({ default: true })
  ativo: boolean;
}

export const LabelSchema = SchemaFactory.createForClass(Label);
