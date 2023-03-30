import { Module } from '@nestjs/common';
import { DisciplinesService } from './disciplines.service';
import { DisciplinesController } from './disciplines.controller';

@Module({
  controllers: [DisciplinesController],
  providers: [DisciplinesService],
})
export class DisciplinesModule {}
