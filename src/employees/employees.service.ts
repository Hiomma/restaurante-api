import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Employee, EmployeeDocument } from '../schemas/employee.schema.js';
import { CreateEmployeeDto, UpdateEmployeeDto } from '../dto/employee.dto.js';
import { Scope, ownerFilter, idFilter } from '../types/scope.js';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel(Employee.name)
    private employeeModel: Model<EmployeeDocument>,
  ) {}

  async create(dto: CreateEmployeeDto, ownerId: string): Promise<EmployeeDocument> {
    const existing = await this.employeeModel.findOne({ username: dto.username, owner: new Types.ObjectId(ownerId) }).exec();
    if (existing) throw new ConflictException('Username already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const employee = new this.employeeModel({
      name: dto.name,
      username: dto.username,
      passwordHash,
      role: dto.role || 'employee',
      owner: new Types.ObjectId(ownerId),
    });
    return employee.save();
  }

  async findByUsername(username: string): Promise<EmployeeDocument[]> {
    return this.employeeModel.find({ username }).exec();
  }

  async findAll(scope: Scope): Promise<EmployeeDocument[]> {
    return this.employeeModel
      .find(ownerFilter(scope))
      .select('-passwordHash')
      .sort({ name: 1 })
      .exec();
  }

  async findById(id: string, scope: Scope): Promise<EmployeeDocument> {
    const employee = await this.employeeModel
      .findOne(idFilter(id, scope))
      .select('-passwordHash')
      .exec();
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async update(id: string, dto: UpdateEmployeeDto, scope: Scope): Promise<EmployeeDocument> {
    const updateData: any = { ...dto };
    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10);
      delete updateData.password;
    }
    const employee = await this.employeeModel
      .findOneAndUpdate(idFilter(id, scope), updateData, { new: true })
      .select('-passwordHash')
      .exec();
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async remove(id: string, scope: Scope): Promise<void> {
    const result = await this.employeeModel.findOneAndDelete(idFilter(id, scope)).exec();
    if (!result) throw new NotFoundException('Employee not found');
  }

  async changeOwnPassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const employee = await this.employeeModel.findById(id).exec();
    if (!employee) throw new NotFoundException('Employee not found');

    const matches = await bcrypt.compare(currentPassword, employee.passwordHash);
    if (!matches) throw new UnauthorizedException('Current password is incorrect');

    employee.passwordHash = await bcrypt.hash(newPassword, 10);
    await employee.save();
  }
}
