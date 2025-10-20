import { Test, TestingModule } from '@nestjs/testing';
import { CommonAreasService } from './common-areas.service';

describe('CommonAreasService', () => {
  let service: CommonAreasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommonAreasService],
    }).compile();

    service = module.get<CommonAreasService>(CommonAreasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
