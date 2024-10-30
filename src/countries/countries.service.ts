import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { z } from 'zod';
import { Country } from './country.dto';
import { GraphqlService } from 'src/graphql/graphql.service';
import { COUNTRIES_QUERY } from './countries.query';
import { CountrySchema } from './countries.zod';

@Injectable()
export class CountriesService {
  private graphQLClient: GraphQLClient;
  constructor(private readonly graphqlService: GraphqlService) {
    this.graphQLClient = this.graphqlService.getClient();
  }

  async getCountries(): Promise<Country[]> {
    const data = await this.graphQLClient.request(COUNTRIES_QUERY);
    const reponse = z
      .object({
        getCountries: z.array(CountrySchema),
      })
      .parse(data);
    return reponse.getCountries
      .filter((country) => country.isValid)
      .map((country) => {
        return {
          areaCode: country.areaCode,
          areaName: country.areaName,
          id: country.id,
          countryName: country.countryName,
        };
      });
  }
}
