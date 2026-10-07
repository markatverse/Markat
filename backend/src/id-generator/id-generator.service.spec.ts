import { Test, TestingModule } from '@nestjs/testing';
import { IdGeneratorService } from './id-generator.service.js';
import { PrismaService } from '../prisma.service.js';

describe('IdGeneratorService', () => {
  let service: IdGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdGeneratorService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<IdGeneratorService>(IdGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
