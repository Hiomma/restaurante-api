import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Employee, EmployeeDocument } from '../schemas/employee.schema.js';
import { CreateEmployeeDto, UpdateEmployeeDto } from '../dto/employee.dto.js';

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

  async findAll(ownerId: string): Promise<EmployeeDocument[]> {
    return this.employeeModel
      .find({ owner: new Types.ObjectId(ownerId) })
      .select('-passwordHash')
      .sort({ name: 1 })
      .exec();
  }

  async findById(id: string): Promise<EmployeeDocument> {
    const employee = await this.employeeModel.findById(id).select('-passwordHash').exec();
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async update(id: string, dto: UpdateEmployeeDto): Promise<EmployeeDocument> {
    const updateData: any = { ...dto };
    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10);
      delete updateData.password;
    }
    const employee = await this.employeeModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-passwordHash')
      .exec();
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async remove(id: string): Promise<void> {
    const result = await this.employeeModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Employee not found');
  }
}
