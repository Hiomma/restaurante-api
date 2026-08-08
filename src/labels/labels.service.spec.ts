import { Model } from 'mongoose';
import { LabelsService } from './labels.service';

const mockModel = () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
});

describe('LabelsService', () => {
  let service: LabelsService;
  let model: any;

  beforeEach(() => {
    model = mockModel() as any;
    service = new LabelsService(model as any);
  });

  it('should create label', async () => {
    model.create.mockResolvedValue({ _id: '1', name: 'VIP' } as any);
    expect(await service.create({ name: 'VIP' } as any)).toBeDefined();
  });

  it('should find all labels', async () => {
    model.find.mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([]) } as any);
    expect(await service.findAll()).toEqual([]);
  });

  it('should find one label', async () => {
    model.findById.mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ _id: '1' } as any) } as any);
    expect(await service.findOne('1')).toBeDefined();
  });

  it('should update label', async () => {
    model.findByIdAndUpdate.mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ _id: '1' } as any) } as any);
    expect(await service.update('1', { name: 'Normal' } as any)).toBeDefined();
  });

  it('should remove label', async () => {
    model.findByIdAndDelete.mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ _id: '1' } as any) } as any);
    expect(await service.remove('1')).toBeDefined();
  });
});
