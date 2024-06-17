import { Module } from '@nestjs/common';
import { AthleteRepresentativesService } from './athlete_representatives.service';
import { AthleteRepresentativesController } from './athlete_representatives.controller';
import { GraphqlService } from 'src/graphql/graphql.service';

@Module({
  controllers: [AthleteRepresentativesController],
  providers: [AthleteRepresentativesService, GraphqlService],
})
export class AthleteRepresentativesModule {}
