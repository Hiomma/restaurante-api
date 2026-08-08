import { Model } from 'mongoose';
import { PortioningService } from './portioning.service';

const mockModel = () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
});

describe('PortioningService', () => {
  let service: PortioningService;
  let model: any;

  beforeEach(() => {
    model = mockModel() as any;
    service = new PortioningService(model as any);
  });

  it('should create portioning', async () => {
    model.create.mockResolvedValue({ _id: '1' } as any);
    expect(await service.create({ productId: 'p1', rawWeightGrams: 1000 } as any)).toBeDefined();
  });

  it('should find all portionings', async () => {
    model.find.mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([]) } as any);
    expect(await service.findAll()).toEqual([]);
  });

  it('should find one portioning', async () => {
    model.findById.mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ _id: '1' } as any) } as any);
    expect(await service.findOne('1')).toBeDefined();
  });

  it('should update portioning', async () => {
    model.findByIdAndUpdate.mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ _id: '1' } as any) } as any);
    expect(await service.update('1', { portionsCount: 10 } as any)).toBeDefined();
  });

  it('should remove portioning', async () => {
    model.findByIdAndDelete.mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ _id: '1' } as any) } as any);
    expect(await service.remove('1')).toBeDefined();
  });
});
