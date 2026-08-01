import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class AgendaItem extends Document {
  @Prop({ required: true, trim: true })
  titulo: string;

  @Prop()
  descricao: string;

  @Prop({ required: true, type: String })
  data: string;

  @Prop({ default: 'pendente', enum: ['pendente','concluido','cancelado'], type: String })
  status: string;

  @Prop({ type: String })
  responsavelId: string;
}

export const AgendaItemSchema = SchemaFactory.createForClass(AgendaItem);
