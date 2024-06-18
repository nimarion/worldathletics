import { Module } from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { CompetitionsController } from './competitions.controller';
import { GraphqlService } from 'src/graphql/graphql.service';

@Module({
  controllers: [CompetitionsController],
  providers: [CompetitionsService, GraphqlService],
})
export class CompetitionsModule {}
