import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class MovementDestination extends Document {
  @Prop({ required: true, trim: true })
  nome: string;

  @Prop({ default: '' })
  descricao: string;

  @Prop({ default: true })
  ativo: boolean;
}

export const MovementDestinationSchema = SchemaFactory.createForClass(MovementDestination);
