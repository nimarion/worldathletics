import { Module } from '@nestjs/common';
import { AthletesService } from './athletes.service';
import { AthletesController } from './athletes.controller';
import { ResultsService } from './results/result.service';
import { GraphqlService } from 'src/graphql/graphql.service';

@Module({
  controllers: [AthletesController],
  providers: [AthletesService, ResultsService, GraphqlService],
})
export class AthletesModule {}
