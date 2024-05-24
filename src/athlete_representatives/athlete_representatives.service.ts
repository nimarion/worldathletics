import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { AthleteRepresentative } from './dto/athlete_representative.dto';
import { AthleteRepresentative as AthleteRepresentativeSchema } from './athlete_representative.zod';
import {
  ATHLETE_REPRESENTATIVES_QUERY,
  ATHLETE_REPRESENTATIVE_QUERY,
} from './athlete_representatives.query';
import { z } from 'zod';
import { formatLastname } from 'src/name.utils';

@Injectable()
export class AthleteRepresentativesService {
  private graphQLClient: GraphQLClient;
  constructor() {
    this.graphQLClient = new GraphQLClient(process.env.STELLATE_ENDPOINT);
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
      email:
        response.getAthleteRepresentativeProfile.email.length > 0
          ? response.getAthleteRepresentativeProfile.email[0]
          : null,
      firstname: response.getAthleteRepresentativeProfile.firstName,
      lastname: formatLastname(
        response.getAthleteRepresentativeProfile.lastName,
      ),
      phone:
        response.getAthleteRepresentativeProfile.mobile.length > 0
          ? response.getAthleteRepresentativeProfile.mobile[0]
          : null,
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
          email: arData ? arData.email : null,
          firstname: ar.firstName,
          lastname: formatLastname(ar.lastName),
          phone: arData ? arData.phone : null,
          id: ar.athleteRepresentativeId,
        });
      },
    );
    await Promise.all(promises);
    return arResponse;
  }
}
