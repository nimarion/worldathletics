import { Injectable } from '@nestjs/common';
import { gql, GraphQLClient } from 'graphql-request';
import { z } from 'zod';
import * as Sentry from '@sentry/node';
import { Country } from './country.entity';
import { GraphqlService } from 'src/graphql/graphql.service';

const COUNTRIES_QUERY = gql`
  query MyQuery {
    getCountries {
      areaCode
      areaName
      id
      isValid
      countryName
    }
  }
`;

const CountrySchema = z.object({
  areaCode: z.string(),
  areaName: z.string(),
  id: z.string(),
  isValid: z.boolean(),
  countryName: z.string(),
});

@Injectable()
export class CountriesService {
  private graphQLClient: GraphQLClient;
  constructor(private readonly graphqlService: GraphqlService) {
    this.graphQLClient = this.graphqlService.getClient();
  }

  async getCountries(): Promise<Country[]> {
    try {
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
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
    }
    return null;
  }
}
