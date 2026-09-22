import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Employee, EmployeeSchema } from '../schemas/employee.schema.js';
import { EmployeesService } from './employees.service.js';
import { EmployeesController } from './employees.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Employee.name, schema: EmployeeSchema }]),
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
