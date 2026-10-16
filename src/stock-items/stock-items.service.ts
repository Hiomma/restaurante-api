import { Injectable, OnModuleInit, NotFoundException, ConflictException, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StockItem, StockItemDocument } from '../schemas/stock-item.schema.js';
import {
  StockItemRemoval,
  StockItemRemovalDocument,
} from '../schemas/stock-item-removal.schema.js';
import { CreateStockItemDto, UpdateStockItemDto, StockItemQueryDto } from '../dto/stock-item.dto.js';
import { Scope, ownerFilter, idFilter } from '../types/scope.js';

function generateQrCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

@Injectable()
export class StockItemsService implements OnModuleInit {
  constructor(
    @InjectModel(StockItem.name)
    private stockItemModel: Model<StockItemDocument>,
    @InjectModel(StockItemRemoval.name)
    private removalModel: Model<StockItemRemovalDocument>,
  ) {}

  /**
   * Migração do índice de QR: a unicidade passou a ser POR RESTAURANTE
   * (`{ owner, qrCode }`), para que restaurantes diferentes possam gerar o
   * mesmo código de 6 caracteres. O índice global antigo é removido (idem-
   * potente: ausente → nada a fazer).
   */
  async onModuleInit() {
    try {
      await this.stockItemModel.collection.dropIndex('qrCode_1');
    } catch {
      // índice antigo já removido (ou nunca existiu)
    }
    await this.stockItemModel.syncIndexes();
  }

  async create(dto: CreateStockItemDto, ownerId: string): Promise<StockItemDocument> {
    // QR enviado pelo cliente (o mesmo já exibido na etiqueta): dentro do
    // restaurante ele precisa ser único — se já existe, não há o que "retryar"
    // (regerar faria a etiqueta impressa divergir do banco), então falha com
    // uma mensagem clara. Sem QR do cliente, o servidor gera um código
    // único dentro do próprio restaurante (índice { owner, qrCode }).
    const requestedQr = dto.qrCode?.trim() ? dto.qrCode.trim().toUpperCase() : undefined;

    const build = (qr: string) =>
      new this.stockItemModel({
        product: {
          productId: dto.productId,
          productName: dto.productName,
          productGroup: dto.productGroup,
          productStorage: dto.productStorage,
        },
        type: dto.type,
        weightGrams: dto.weightGrams,
        manipulationDate: dto.manipulationDate,
        expiryDate: dto.expiryDate,
        originalExpiryDate: dto.originalExpiryDate,
        qrCode: qr,
        lote: dto.lote,
        nf: dto.nf,
        supplier: dto.supplier,
        employeeName: dto.employeeName,
        batchId: dto.batchId,
        destination: dto.destination,
        status: 'in_stock',
        owner: new Types.ObjectId(ownerId),
      });

    if (requestedQr) {
      try {
        return await build(requestedQr).save();
      } catch (error: any) {
        if (error?.code === 11000) {
          throw new ConflictException('QR code already exists in this restaurant');
        }
        throw error;
      }
    }

    let item: StockItemDocument | null = null;
    let attempts = 0;
    while (!item && attempts < 5) {
      attempts++;
      try {
        item = await build(generateQrCode()).save();
      } catch (error: any) {
        if (error?.code === 11000 && attempts < 5) continue;
        throw error;
      }
    }
    if (!item) throw new ConflictException('Could not generate a unique QR code');
    return item;
  }

  async findAll(scope: Scope, query: StockItemQueryDto): Promise<StockItemDocument[]> {
    const filter: any = ownerFilter(scope);
    if (query.status) filter.status = query.status;
    if (query.productId) filter['product.productId'] = query.productId;
    if (query.type) filter.type = query.type;
    if (query.destination) filter.destination = query.destination;
    if (query.supplier) filter.supplier = query.supplier;
    return this.stockItemModel.find(filter).sort({ expiryDate: 1 }).exec();
  }

  async findById(id: string, scope: Scope): Promise<StockItemDocument> {
    const item = await this.stockItemModel.findOne(idFilter(id, scope)).exec();
    if (!item) throw new NotFoundException('Stock item not found');
    return item;
  }

  async findByQrCode(qrCode: string, scope: Scope): Promise<StockItemDocument> {
    const item = await this.stockItemModel
      .findOne({ qrCode, ...ownerFilter(scope) })
      .exec();
    if (item) return item;

    // Sem item ativo: a etiqueta pode ter sido baixada. O tombstone responde
    // que ela JÁ foi usada (410) em vez de fingir que nunca existiu; só sem
    // tombstone o resultado é 404 (código nunca visto neste restaurante).
    const removal = await this.removalModel
      .findOne({ qrCode, ...ownerFilter(scope) })
      .sort({ removedAt: -1 })
      .exec();
    if (removal) {
      throw new HttpException(
        {
          used: true,
          message: 'Etiqueta já baixada',
          qrCode: removal.qrCode,
          productName: removal.productName,
          type: removal.type,
          weightGrams: removal.weightGrams,
          destination: removal.destination,
          userName: removal.userName,
          removedAt: removal.removedAt,
          reason: removal.reason,
        },
        410,
      );
    }

    throw new NotFoundException('Stock item not found');
  }

  async update(id: string, dto: UpdateStockItemDto, scope: Scope): Promise<StockItemDocument> {
    const item = await this.stockItemModel
      .findOneAndUpdate(idFilter(id, scope), dto, { new: true })
      .exec();
    if (!item) throw new NotFoundException('Stock item not found');
    return item;
  }

  /**
   * Baixa da etiqueta. Primeiro localiza o item escopado (ausente → 404,
   * como antes); se existir, grava o tombstone com a cópia dos campos e só
   * então deleta — a consulta posterior ao QR continua sabendo que a
   * etiqueta foi usada, para onde foi e por quem.
   */
  async remove(id: string, scope: Scope, actorName?: string): Promise<void> {
    const item = await this.stockItemModel.findOne(idFilter(id, scope)).exec();
    if (!item) throw new NotFoundException('Stock item not found');

    await this.removalModel.create({
      qrCode: item.qrCode,
      owner: item.owner,
      productId: item.product.productId,
      productName: item.product.productName,
      type: item.type,
      weightGrams: item.weightGrams,
      lote: item.lote,
      destination: item.destination,
      userName: actorName,
    });

    await this.stockItemModel.deleteOne({ _id: item._id }).exec();
  }

  async getLowStock(scope: Scope): Promise<StockItemDocument[]> {
    return this.stockItemModel
      .find({
        ...ownerFilter(scope),
        status: 'in_stock',
      })
      .sort({ expiryDate: 1 })
      .exec();
  }
}
