import { Module } from '@nestjs/common';
import { DisciplinesService } from './disciplines.service';
import { DisciplinesController } from './disciplines.controller';
import { GraphqlService } from 'src/graphql/graphql.service';

@Module({
  controllers: [DisciplinesController],
  providers: [DisciplinesService, GraphqlService],
})
export class DisciplinesModule {}
