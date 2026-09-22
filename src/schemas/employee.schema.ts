import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EmployeeDocument = HydratedDocument<Employee>;

@Schema({ timestamps: true })
export class Employee {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ default: 'employee', enum: ['employee', 'admin'] })
  role: string;

  @Prop({ default: true })
  active: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
