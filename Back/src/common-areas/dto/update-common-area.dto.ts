import { PartialType } from '@nestjs/mapped-types';
import { CreateCommonAreaDto } from './create-common-area.dto';

export class UpdateCommonAreaDto extends PartialType(CreateCommonAreaDto) {}
