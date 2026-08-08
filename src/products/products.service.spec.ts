import { Model } from 'mongoose';
import { ProductsService } from './products.service';

const mockModel = () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
});

describe('ProductsService', () => {
  let service: ProductsService;
  let model: any;

  beforeEach(() => {
    model = mockModel() as any;
    service = new ProductsService(model as any);
  });

  it('should create product', async () => {
    model.create.mockResolvedValue({ _id: '1' } as any);
    expect(await service.create({ name: 'P' } as any)).toBeDefined();
  });

  it('should find all products', async () => {
    model.find.mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([]) } as any);
    expect(await service.findAll()).toEqual([]);
  });

  it('should find one product', async () => {
    model.findById.mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ _id: '1' } as any) } as any);
    expect(await service.findOne('1')).toBeDefined();
  });

  it('should update product', async () => {
    model.findByIdAndUpdate.mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ _id: '1' } as any) } as any);
    expect(await service.update('1', { name: 'X' } as any)).toBeDefined();
  });

  it('should remove product', async () => {
    model.findByIdAndDelete.mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ _id: '1' } as any) } as any);
    expect(await service.remove('1')).toBeDefined();
  });
});
