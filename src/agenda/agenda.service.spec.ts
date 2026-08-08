import { Model } from 'mongoose';
import { AgendaService } from './agenda.service';

const mockModel = () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
});

describe('AgendaService', () => {
  let service: AgendaService;
  let model: any;

  beforeEach(() => {
    model = mockModel() as any;
    service = new AgendaService(model as any);
  });

  it('should create agenda item', async () => {
    model.create.mockResolvedValue({ _id: '1' } as any);
    expect(await service.create({ name: 'Reunião', datePerformed: '2025-01-01', expiryDate: '2025-01-02' } as any)).toBeDefined();
  });

  it('should find all agenda items', async () => {
    model.find.mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([]) } as any);
    expect(await service.findAll()).toEqual([]);
  });

  it('should find one agenda item', async () => {
    model.findById.mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ _id: '1' } as any) } as any);
    expect(await service.findOne('1')).toBeDefined();
  });

  it('should update agenda item', async () => {
    model.findByIdAndUpdate.mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ _id: '1' } as any) } as any);
    expect(await service.update('1', { name: 'Outro' } as any)).toBeDefined();
  });

  it('should remove agenda item', async () => {
    model.findByIdAndDelete.mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ _id: '1' } as any) } as any);
    expect(await service.remove('1')).toBeDefined();
  });
});
