import { Model } from 'mongoose';

const mockLean = jest.fn();
const mockExec = jest.fn();

export const mockedModel = () => ({
  create: jest.fn(),
  find: jest.fn().mockReturnValue({ lean: mockLean, exec: mockExec }),
  findOne: jest.fn().mockReturnValue({ exec: mockExec }),
  findById: jest.fn().mockReturnValue({ lean: mockLean, exec: mockExec }),
  findByIdAndUpdate: jest.fn().mockReturnValue({ lean: mockLean, exec: mockExec }),
  findByIdAndDelete: jest.fn().mockReturnValue({ lean: mockLean, exec: mockExec }),
  countDocuments: jest.fn().mockReturnValue({ exec: mockExec }),
  deleteMany: jest.fn().mockReturnValue({ exec: mockExec }),
  exec: mockExec,
  lean: mockLean,
});
