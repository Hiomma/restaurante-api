import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/**
 * Tombstone de etiqueta baixada: cópia do item no instante em que ele é
 * deletado. Sem isto, a consulta posterior ao QR diria apenas "não
 * encontrado"; com o tombstone a API responde que a etiqueta JÁ foi usada,
 * para onde foi e por quem — mesmo o item ativo não existindo mais.
 */
@Schema({ timestamps: { createdAt: 'removedAt', updatedAt: false } })
export class StockItemRemoval {
  @Prop({ required: true })
  qrCode: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true, enum: ['raw', 'portioned'] })
  type: string;

  @Prop({ required: true })
  weightGrams: number;

  @Prop()
  lote?: string;

  /** Para onde a peça foi no momento da baixa (recebido/porcionado). */
  @Prop()
  destination?: string;

  /** Quem removeu (nome resolvido pelo controller no momento da baixa). */
  @Prop()
  userName?: string;

  @Prop()
  reason?: string;

  /** Instante da baixa, preenchido pelo mecanismo de timestamps. */
  @Prop()
  removedAt?: Date;
}

export type StockItemRemovalDocument = HydratedDocument<StockItemRemoval>;
export const StockItemRemovalSchema = SchemaFactory.createForClass(StockItemRemoval);

/** Lookup do tombstone pela consulta de QR (sempre escopado por owner). */
StockItemRemovalSchema.index({ owner: 1, qrCode: 1, removedAt: -1 });
