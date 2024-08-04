import { Module } from '@nestjs/common';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { GraphqlService } from 'src/graphql/graphql.service';

@Module({
  controllers: [RecordsController],
  providers: [RecordsService, GraphqlService],
})
export class RecordsModule {}
