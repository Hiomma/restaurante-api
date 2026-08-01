import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true, trim: true })
  nome: string;

  @Prop({ required: true, min: 0 })
  precoCusto: number;

  @Prop({ required: true, min: 0 })
  precoVenda: number;

  @Prop({ default: 'UN' })
  unidade: string;

  @Prop({ default: true })
  ativo: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
