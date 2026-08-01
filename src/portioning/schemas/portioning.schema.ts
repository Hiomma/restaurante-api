import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Portioning extends Document {
  @Prop({ required: true, trim: true })
  produtoId: string;

  @Prop({ required: true, min: 0 })
  quantidade: number;

  @Prop({ required: true, trim: true })
  unidadeBase: string;

  @Prop({ required: true })
  porcoes: number;

  @Prop({ required: true, trim: true })
  unidadePorcao: string;

  @Prop({ default: true })
  ativo: boolean;
}

export const PortioningSchema = SchemaFactory.createForClass(Portioning);
