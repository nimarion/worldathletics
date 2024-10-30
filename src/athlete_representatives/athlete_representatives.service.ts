import { Injectable } from '@nestjs/common';
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
    const {
      countryCode: country,
      email,
      firstName: firstname,
      lastName: lastname,
      mobile: phone,
    } = response.getAthleteRepresentativeProfile;

    return {
      country,
      email,
      firstname,
      lastname,
      phone,
      id,
    };
  }

  async getAthleteRepresentatives(): Promise<AthleteRepresentative[]> {
    const data = await this.graphQLClient.request(
      ATHLETE_REPRESENTATIVES_QUERY,
    );
    const response = z
      .object({
        getAthleteRepresentativeDirectory: z.array(AthleteRepresentativeSchema),
      })
      .parse(data);
    const arResponse: AthleteRepresentative[] = [];
    const promises = await response.getAthleteRepresentativeDirectory.map(
      async (ar) => {
        const arData = await this.getAthleteRepresentative(
          ar.athleteRepresentativeId,
        );
        if (arData) {
          arResponse.push(arData);
        }
      },
    );
    return await Promise.all(promises).then(() => {
      return arResponse;
    });
  }
}
