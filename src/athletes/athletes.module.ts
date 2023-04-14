import { Module } from '@nestjs/common';
import { AthletesService } from './athletes.service';
import { AthletesController } from './athletes.controller';
import { ResultsService } from './results/result.service';

@Module({
  controllers: [AthletesController],
  providers: [AthletesService, ResultsService],
})
export class AthletesModule {}
