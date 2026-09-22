import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MovementDestinationDocument = HydratedDocument<MovementDestination>;

@Schema({ timestamps: true })
export class MovementDestination {
  @Prop({ required: true })
  name: string;

  @Prop({ default: true })
  active: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;
}

export const MovementDestinationSchema = SchemaFactory.createForClass(MovementDestination);
