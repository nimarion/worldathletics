import { Global, Module } from '@nestjs/common';
import { GraphqlService } from './graphql.service';
import { GraphqlController } from './graphql.controller';

@Global()
@Module({
  controllers: [GraphqlController],
  providers: [GraphqlService],
  exports: [GraphqlService],
})
export class GraphqlModule {}
