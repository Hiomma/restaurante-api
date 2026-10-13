import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Supplier, SupplierDocument } from '../schemas/supplier.schema.js';
import { CreateSupplierDto, UpdateSupplierDto } from '../dto/supplier.dto.js';
import { Scope, ownerFilter, idFilter } from '../types/scope.js';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectModel(Supplier.name)
    private supplierModel: Model<SupplierDocument>,
  ) {}

  async create(dto: CreateSupplierDto, ownerId: string): Promise<SupplierDocument> {
    const supplier = new this.supplierModel({
      name: dto.name,
      owner: new Types.ObjectId(ownerId),
    });
    return supplier.save();
  }

  async findAll(scope: Scope): Promise<SupplierDocument[]> {
    return this.supplierModel
      .find(ownerFilter(scope))
      .sort({ name: 1 })
      .exec();
  }

  async findById(id: string, scope: Scope): Promise<SupplierDocument> {
    const supplier = await this.supplierModel.findOne(idFilter(id, scope)).exec();
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async update(id: string, dto: UpdateSupplierDto, scope: Scope): Promise<SupplierDocument> {
    const supplier = await this.supplierModel
      .findOneAndUpdate(idFilter(id, scope), dto, { new: true })
      .exec();
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async remove(id: string, scope: Scope): Promise<void> {
    const result = await this.supplierModel.findOneAndDelete(idFilter(id, scope)).exec();
    if (!result) throw new NotFoundException('Supplier not found');
  }
}
