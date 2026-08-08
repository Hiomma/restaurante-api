import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  let service: ReportsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportsService],
    }).compile();
    service = module.get(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('stockSummary should return object', () => {
    expect(service.stockSummary()).toEqual({ message: 'Stock summary report' });
  });

  it('movementsReport should return object', () => {
    expect(service.movementsReport()).toEqual({ message: 'Movements report' });
  });
});
