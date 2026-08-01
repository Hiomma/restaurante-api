import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeSchema } from './schemas/employee.schema';

@Injectable()
export class EmployeesService {
  constructor(@InjectModel(Employee.name) private employeeModel: Model<Employee>) {}

  create(data: Partial<Employee>) {
    return this.employeeModel.create(data);
  }

  findAll() {
    return this.employeeModel.find({}).lean().exec();
  }

  findOne(id: string) {
    return this.employeeModel.findById(id).lean().exec();
  }

  update(id: string, data: Partial<Employee>) {
    return this.employeeModel.findByIdAndUpdate(id, data, { new: true }).lean().exec();
  }

  remove(id: string) {
    return this.employeeModel.findByIdAndDelete(id).lean().exec();
  }
}
