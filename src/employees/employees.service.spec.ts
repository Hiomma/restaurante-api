import { Model } from 'mongoose';
import { EmployeesService } from './employees.service';

const mockModel = () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
});

describe('EmployeesService', () => {
  let service: EmployeesService;
  let model: any;

  beforeEach(() => {
    model = mockModel() as any;
    service = new EmployeesService(model as any);
  });

  it('should create employee', async () => {
    model.create.mockResolvedValue({ _id: '1', name: 'Jane' } as any);
    expect(await service.create({ name: 'Jane', username: 'jane', password: '123' } as any)).toBeDefined();
  });

  it('should find all employees', async () => {
    model.find.mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([]) } as any);
    expect(await service.findAll()).toEqual([]);
  });

  it('should find one employee', async () => {
    model.findById.mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ _id: '1' } as any) } as any);
    expect(await service.findOne('1')).toBeDefined();
  });

  it('should update employee', async () => {
    model.findByIdAndUpdate.mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ _id: '1' } as any) } as any);
    expect(await service.update('1', { name: 'John' } as any)).toBeDefined();
  });

  it('should remove employee', async () => {
    model.findByIdAndDelete.mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ _id: '1' } as any) } as any);
    expect(await service.remove('1')).toBeDefined();
  });
});
