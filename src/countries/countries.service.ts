import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GraphQLClient } from 'graphql-request';
import { z } from 'zod';
import { Country } from './country.dto';
import { GraphqlService } from 'src/graphql/graphql.service';
import { COUNTRIES_QUERY } from './countries.query';
import { CountrySchema } from './countries.zod';

@Injectable()
export class CountriesService {
  private graphQLClient: GraphQLClient;
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly graphqlService: GraphqlService,
  ) {
    this.graphQLClient = this.graphqlService.getClient();
  }

  async getCountries(): Promise<Country[]> {
    const cacheKey = 'countries:all';
    const cached = await this.cacheManager.get<Country[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await this.graphQLClient.request(COUNTRIES_QUERY);
    const reponse = z
      .object({
        getCountries: z.array(CountrySchema),
      })
      .parse(data);

    const countries = reponse.getCountries
      .filter((country) => country.isValid)
      .map((country) => {
        return {
          areaCode: country.areaCode,
          areaName: country.areaName,
          id: country.id,
          countryName: country.countryName,
        };
      });

    await this.cacheManager.set(cacheKey, countries, 24 * 60 * 60 * 1000); // cache for 24 hours (86400000ms)
    return countries;
  }
}
