import { Model } from 'mongoose';
import { MovementsService } from './movements.service';

const mockModel = () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
});

describe('MovementsService', () => {
  let service: MovementsService;
  let model: any;

  beforeEach(() => {
    model = mockModel() as any;
    service = new MovementsService(model as any);
  });

  it('should create movement', async () => {
    model.create.mockResolvedValue({ _id: '1' } as any);
    expect(await service.create({ productId: 'p1', movementType: 'entrada', quantity: 1, date: '2025-01-01' } as any)).toBeDefined();
  });

  it('should find all movements', async () => {
    model.find.mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([]) } as any);
    expect(await service.findAll()).toEqual([]);
  });

  it('should find one movement', async () => {
    model.findById.mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ _id: '1' } as any) } as any);
    expect(await service.findOne('1')).toBeDefined();
  });

  it('should update movement', async () => {
    model.findByIdAndUpdate.mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ _id: '1' } as any) } as any);
    expect(await service.update('1', { quantity: 2 } as any)).toBeDefined();
  });

  it('should remove movement', async () => {
    model.findByIdAndDelete.mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ _id: '1' } as any) } as any);
    expect(await service.remove('1')).toBeDefined();
  });
});
