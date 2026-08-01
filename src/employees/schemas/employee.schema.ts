import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Employee extends Document {
  @Prop({ required: true, trim: true })
  nome: string;

  @Prop({ required: true, unique: true })
  cpf: string;

  @Prop()
  telefone: string;

  @Prop()
  email: string;

  @Prop({ default: true })
  ativo: boolean;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
