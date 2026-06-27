import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GraphQLClient } from 'graphql-request';
import { AthleteRepresentative } from './athlete_representative.dto';
import { AthleteRepresentative as AthleteRepresentativeSchema } from './athlete_representative.zod';
import {
  ATHLETE_REPRESENTATIVES_QUERY,
  ATHLETE_REPRESENTATIVE_QUERY,
} from './athlete_representatives.query';
import { z } from 'zod';
import { GraphqlService } from 'src/graphql/graphql.service';

@Injectable()
export class AthleteRepresentativesService {
  private graphQLClient: GraphQLClient;
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly graphqlService: GraphqlService,
  ) {
    this.graphQLClient = this.graphqlService.getClient();
  }

  async getAthleteRepresentative(
    id: number,
  ): Promise<AthleteRepresentative | null> {
    const cacheKey = `athlete_representative:${id}`;
    const cached = await this.cacheManager.get<AthleteRepresentative>(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await this.graphQLClient.request(
      ATHLETE_REPRESENTATIVE_QUERY,
      {
        id: String(id),
      },
      {
        'x-athlete-representative-id': String(id),
      },
    );
    const response = z
      .object({
        getAthleteRepresentativeProfile: AthleteRepresentativeSchema.nullable(),
      })
      .parse(data);
    if (!response.getAthleteRepresentativeProfile) {
      return null;
    }
    const {
      countryCode: country,
      email,
      firstName: firstname,
      lastName: lastname,
      mobile: phone,
    } = response.getAthleteRepresentativeProfile;

    const result = {
      country,
      email,
      firstname,
      lastname,
      phone,
      id,
    };

    await this.cacheManager.set(cacheKey, result, 24 * 60 * 60 * 1000); // Cache for 24 hours
    return result;
  }

  async getAthleteRepresentatives(): Promise<AthleteRepresentative[]> {
    const cacheKey = 'athlete_representatives:all';
    const cached =
      await this.cacheManager.get<AthleteRepresentative[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await this.graphQLClient.request(
      ATHLETE_REPRESENTATIVES_QUERY,
    );
    const response = z
      .object({
        getAthleteRepresentativeDirectory: z.array(AthleteRepresentativeSchema),
      })
      .parse(data);
    const arResponse: AthleteRepresentative[] = [];
    const promises = response.getAthleteRepresentativeDirectory.map(
      async (ar) => {
        const arData = await this.getAthleteRepresentative(
          ar.athleteRepresentativeId,
        );
        if (arData) {
          arResponse.push(arData);
        }
      },
    );
    await Promise.all(promises);

    await this.cacheManager.set(cacheKey, arResponse, 24 * 60 * 60 * 1000); // Cache for 24 hours
    return arResponse;
  }
}
