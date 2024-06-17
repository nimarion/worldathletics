import { Module } from '@nestjs/common';
import { GraphqlService } from './graphql.service';

@Module({
  controllers: [],
  providers: [GraphqlService],
})
export class GraphqlModule {}
