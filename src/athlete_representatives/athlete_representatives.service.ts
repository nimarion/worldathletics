import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GraphQLClient } from 'graphql-request';
import { AthleteRepresentative, RepresentedAthlete } from './athlete_representative.dto';
import {
  AthleteRepresentative as AthleteRepresentativeSchema,
  RepresentedAthleteSchema,
} from './athlete_representative.zod';
import {
  ATHLETE_REPRESENTATIVES_QUERY,
  ATHLETE_REPRESENTATIVE_QUERY,
  REPRESENTED_ATHLETES_QUERY,
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

    const directory = response.getAthleteRepresentativeDirectory;
    const results: (AthleteRepresentative | null)[] = new Array(
      directory.length,
    ).fill(null);

    // Use a concurrency-limited pool of 10 parallel requests to prevent overloading/timeout (ETIMEDOUT)
    const concurrency = 10;
    let index = 0;

    const worker = async () => {
      while (index < directory.length) {
        const currentIndex = index++;
        const ar = directory[currentIndex];
        try {
          const arData = await this.getAthleteRepresentative(
            ar.athleteRepresentativeId,
          );
          results[currentIndex] = arData;
        } catch (error) {
          console.error(
            `Failed to fetch representative profile for id ${ar.athleteRepresentativeId}:`,
            error,
          );
        }
      }
    };

    const workers = Array.from({ length: concurrency }, () => worker());
    await Promise.all(workers);

    const arResponse = results.filter(
      (ar): ar is AthleteRepresentative => ar !== null,
    );

    await this.cacheManager.set(cacheKey, arResponse, 24 * 60 * 60 * 1000); // Cache for 24 hours
    return arResponse;
  }

  async getRepresentedAthletes(
    id: number,
  ): Promise<RepresentedAthlete[] | null> {
    const cacheKey = `athlete_representative:athletes:${id}`;
    const cached = await this.cacheManager.get<RepresentedAthlete[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await this.graphQLClient.request(
      REPRESENTED_ATHLETES_QUERY,
      {
        id: String(id),
      },
      {
        'x-athlete-representative-id': String(id),
      },
    );

    const response = z
      .object({
        getAthleteRepresentativeProfile: z
          .object({
            toplist: z
              .object({
                athletes: z.array(RepresentedAthleteSchema),
              })
              .nullable(),
          })
          .nullable(),
      })
      .parse(data);

    if (
      !response.getAthleteRepresentativeProfile ||
      !response.getAthleteRepresentativeProfile.toplist ||
      !response.getAthleteRepresentativeProfile.toplist.athletes
    ) {
      return null;
    }

    const athletes: RepresentedAthlete[] = response.getAthleteRepresentativeProfile.toplist.athletes.map(
      (a) => ({
        id: a.athleteId,
        firstname: a.firstName,
        lastname: a.lastName,
        country: a.countryCode,
        birthdate: a.birthdate ? a.birthdate.date : null,
        birthdateOnlyYear: a.birthdate ? a.birthdate.birthdateOnlyYear : false,
        sex: a.gender,
      }),
    );

    await this.cacheManager.set(cacheKey, athletes, 24 * 60 * 60 * 1000); // Cache for 24 hours
    return athletes;
  }
}
