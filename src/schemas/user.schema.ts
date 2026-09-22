import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  imagePath: string;

  @Prop({ type: Object, default: {} })
  company: {
    name?: string;
    cnpj?: string;
    address?: string;
    phone?: string;
  };

  @Prop({ ref: 'User' })
  owner: User;
}

export const UserSchema = SchemaFactory.createForClass(User);
