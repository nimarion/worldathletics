import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { AthleteRepresentative } from './dto/athlete_representative.dto';
import { AthleteRepresentative as AthleteRepresentativeSchema } from './athlete_representative.zod';
import {
  ATHLETE_REPRESENTATIVES_QUERY,
  ATHLETE_REPRESENTATIVE_QUERY,
} from './athlete_representatives.query';
import { z } from 'zod';
import { formatLastname } from 'src/utils';
import parsePhoneNumber from 'libphonenumber-js';
import { GraphqlService } from 'src/graphql/graphql.service';

@Injectable()
export class AthleteRepresentativesService {
  private graphQLClient: GraphQLClient;
  constructor(private readonly graphqlService: GraphqlService) {
    this.graphQLClient = this.graphqlService.getClient();
  }

  sanitizeEmail(email) {
    // Define regex for valid characters in the local part of the email
    const localPartRegex = /[^a-zA-Z0-9._%+-]/g;
    // Define regex for valid characters in the domain part of the email
    const domainPartRegex = /[^a-zA-Z0-9.-]/g;

    // Split the email into local and domain parts
    let [localPart, domainPart] = email.split('@');

    // Sanitize the local part
    localPart = localPart.replace(localPartRegex, '');

    // Sanitize the domain part if it exists
    if (domainPart) {
      domainPart = domainPart.replace(domainPartRegex, '');
    }

    // Reassemble the sanitized email
    return domainPart ? `${localPart}@${domainPart}` : localPart;
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

    const phoneNumber =
      response.getAthleteRepresentativeProfile.mobile.length > 0
        ? parsePhoneNumber(response.getAthleteRepresentativeProfile.mobile[0])
        : null;

    return {
      country: response.getAthleteRepresentativeProfile.countryCode,
      email:
        response.getAthleteRepresentativeProfile.email.length > 0
          ? this.sanitizeEmail(
              response.getAthleteRepresentativeProfile.email[0],
            )
          : null,
      firstname: response.getAthleteRepresentativeProfile.firstName,
      lastname: formatLastname(
        response.getAthleteRepresentativeProfile.lastName,
      ),
      phone: phoneNumber ? phoneNumber.formatInternational() : null,
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
