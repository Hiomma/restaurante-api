import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['Carnes', 'Aves', 'Peixes', 'Frios', 'Laticinios', 'Hortifruti', 'Graos', 'Bebidas', 'Temperos', 'Massas', 'Outros'] })
  group: string;

  @Prop({ required: true, enum: ['Refrigerado', 'Congelado', 'Temperatura Ambiente', 'Camara Fria'] })
  storageMethod: string;

  @Prop({ required: true })
  shelfLifeDays: number;

  @Prop({ default: 0 })
  minQuantity: number;

  @Prop({ default: 0 })
  minPortionedQuantity: number;

  @Prop({ default: 0 })
  consumeAfterOpeningDays: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
