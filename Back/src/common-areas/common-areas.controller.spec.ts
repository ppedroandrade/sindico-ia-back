import { Test, TestingModule } from '@nestjs/testing';
import { CommonAreasController } from './common-areas.controller';

describe('CommonAreasController', () => {
  let controller: CommonAreasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommonAreasController],
    }).compile();

    controller = module.get<CommonAreasController>(CommonAreasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
