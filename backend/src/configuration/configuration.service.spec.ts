import { Test, TestingModule } from '@nestjs/testing';
import { ConfigurationService } from './configuration.service.js';
import { PrismaService } from '../prisma.service.js';

describe('ConfigurationService', () => {
  let service: ConfigurationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigurationService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<ConfigurationService>(ConfigurationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
