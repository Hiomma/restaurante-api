import { Model } from 'mongoose';
import { UsersService } from './users.service';

const mockModel = () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  findOne: jest.fn(),
});

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let model: any;

  beforeEach(() => {
    model = mockModel() as any;
    service = new UsersService(model as any);
  });

  it('should create user', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed' as never);
    const spy = jest.spyOn(service as any, 'sanitize').mockReturnValue({ _id: '1', email: 'a@b.com', name: 'A' } as any);
    model.create.mockResolvedValue({ _id: '1', email: 'a@b.com', password: 'hashed', name: 'A' } as any);
    const result = await service.create({ email: 'a@b.com', name: 'A', password: '123' } as any);
    expect(result).toBeDefined();
    expect(model.create).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should find all users', async () => {
    const spy = jest.spyOn(service as any, 'sanitize').mockReturnValue({} as any);
    model.find.mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([]) } as any);
    expect(await service.findAll()).toEqual([]);
    spy.mockRestore();
  });

  it('should find one user', async () => {
    const spy = jest.spyOn(service as any, 'sanitize').mockReturnValue({ _id: '1' } as any);
    model.findById.mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ _id: '1' } as any) } as any);
    expect(await service.findById('1')).toBeDefined();
    spy.mockRestore();
  });

  it('should update user', async () => {
    const spy = jest.spyOn(service as any, 'sanitize').mockReturnValue({ _id: '1' } as any);
    model.findByIdAndUpdate.mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ _id: '1' } as any) } as any);
    expect(await service.update('1', { name: 'B' } as any)).toBeDefined();
    spy.mockRestore();
  });

  it('should remove user', async () => {
    model.findByIdAndDelete.mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ _id: '1' } as any) } as any);
    expect(await service.remove('1')).toEqual({ deleted: true });
  });

  it('should find by email', async () => {
    model.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ email: 'a@b.com' } as any) } as any);
    expect(await service.findByEmail('a@b.com')).toBeDefined();
  });

  it('should compare password', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true as never);
    expect(await service.comparePassword('secret', 'hash')).toBe(true);
    expect(bcrypt.compare).toHaveBeenCalledWith('secret', 'hash');
  });
});
