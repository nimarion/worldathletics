import { Module } from '@nestjs/common';
import { AthleteRepresentativesService } from './athlete_representatives.service';
import { AthleteRepresentativesController } from './athlete_representatives.controller';

@Module({
  controllers: [AthleteRepresentativesController],
  providers: [AthleteRepresentativesService],
})
export class AthleteRepresentativesModule {}
