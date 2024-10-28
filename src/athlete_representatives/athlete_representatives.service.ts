import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { AthleteRepresentative } from './dto/athlete_representative.dto';
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
  constructor(private readonly graphqlService: GraphqlService) {
    this.graphQLClient = this.graphqlService.getClient();
  }

  async getAthleteRepresentative(
    id: number,
  ): Promise<AthleteRepresentative | null> {
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

    return {
      country: response.getAthleteRepresentativeProfile.countryCode,
      email: response.getAthleteRepresentativeProfile.email,
      firstname: response.getAthleteRepresentativeProfile.firstName,
      lastname: response.getAthleteRepresentativeProfile.lastName,
      phone: response.getAthleteRepresentativeProfile.mobile,
      id: response.getAthleteRepresentativeProfile.athleteRepresentativeId,
    };
  }

  async getAthleteRepresentatives(): Promise<AthleteRepresentative[] | null> {
    const data = await this.graphQLClient.request(
      ATHLETE_REPRESENTATIVES_QUERY,
    );
    const response = z
      .object({
        getAthleteRepresentativeDirectory: z.array(AthleteRepresentativeSchema),
      })
      .parse(data);
    if (!response.getAthleteRepresentativeDirectory) {
      return null;
    }
    const arResponse: AthleteRepresentative[] = [];
    const promises = await response.getAthleteRepresentativeDirectory.map(
      async (ar) => {
        const arData = await this.getAthleteRepresentative(
          ar.athleteRepresentativeId,
        );

        arResponse.push({
          country: ar.countryCode,
          email: arData.email,
          firstname: ar.firstName,
          lastname: ar.lastName,
          phone: arData.phone,
          id: ar.athleteRepresentativeId,
        });
      },
    );
    await Promise.all(promises);
    return arResponse;
  }
}
