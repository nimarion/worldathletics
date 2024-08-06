import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { GraphqlService } from 'src/graphql/graphql.service';
import { COMPETITION_ORGANISER } from './competition.query';
import { z } from 'zod';
import { CompetitionOrganiserInfo } from './competition.dto';
import parsePhoneNumber from 'libphonenumber-js';
import { CompetitionOrganiserInfoSchema } from './competition.zod';

@Injectable()
export class CompetitionsService {
  private graphQLClient: GraphQLClient;
  constructor(private readonly graphqlService: GraphqlService) {
    this.graphQLClient = this.graphqlService.getClient();
  }

  async findCompetitionOrganiserInfo(
    competitionId: number,
  ): Promise<CompetitionOrganiserInfo | null> {
    try {
      const data = await this.graphQLClient.request(COMPETITION_ORGANISER, {
        competitionId,
      });
      const response = z
        .object({
          getCompetitionOrganiserInfo: CompetitionOrganiserInfoSchema,
        })
        .parse(data);

      const events = new Map<string, string[]>();
      response.getCompetitionOrganiserInfo.units.forEach((unit) => {
        const disciplines: string[] = [];
        unit.events.forEach((event) => {
          disciplines.push(event);
        });
        events.set(unit.gender, disciplines);
      });

      return {
        liveStreamUrl: response.getCompetitionOrganiserInfo.liveStreamingUrl,
        resultsUrl: response.getCompetitionOrganiserInfo.resultsPageUrl,
        websiteUrl: response.getCompetitionOrganiserInfo.websiteUrl,
        events: JSON.parse(JSON.stringify(Object.fromEntries(events))),
        contactPersons: response.getCompetitionOrganiserInfo.contactPersons.map(
          (contact) => {
            return {
              email: contact.email,
              name: contact.name,
              phone: parsePhoneNumber(
                contact.phoneNumber,
              ).formatInternational(),
              role: contact.title,
            };
          },
        ),
      };
    } catch (error) {
      console.error(error);
    }
    return null;
  }
}
