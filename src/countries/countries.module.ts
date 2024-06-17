import { Module } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CountriesController } from './countries.controller';
import { GraphqlService } from 'src/graphql/graphql.service';

@Module({
  controllers: [CountriesController],
  providers: [CountriesService, GraphqlService],
})
export class CountriesModule {}
