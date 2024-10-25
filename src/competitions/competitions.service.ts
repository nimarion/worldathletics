import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { GraphqlService } from 'src/graphql/graphql.service';
import { COMPETITION_CALENDAR, COMPETITION_ORGANISER } from './competition.query';
import { z } from 'zod';
import { Competition, CompetitionOrganiserInfo } from './competition.dto';
import parsePhoneNumber from 'libphonenumber-js';
import { CompetitionOrganiserInfoSchema, CompetitionSchema } from './competition.zod';
import { parseVenue } from 'src/utils';

@Injectable()
export class CompetitionsService {
  private graphQLClient: GraphQLClient;
  constructor(private readonly graphqlService: GraphqlService) {
    this.graphQLClient = this.graphqlService.getClient();
  }

  async findCompetitionOrganiserInfo(
    competitionId: number,
  ): Promise<CompetitionOrganiserInfo | null> {
      const data = await this.graphQLClient.request(COMPETITION_ORGANISER, {
        competitionId,
      });
      const response = z
        .object({
          getCompetitionOrganiserInfo: CompetitionOrganiserInfoSchema,
        })
        .safeParse(data);
      if(response.success){
        const events = new Map<string, string[]>();
        response.data.getCompetitionOrganiserInfo.units.forEach((unit) => {
          const disciplines: string[] = [];
          unit.events.forEach((event) => {
            disciplines.push(event);
          });
          events.set(unit.gender, disciplines);
        });
  
        return {
          liveStreamUrl: response.data.getCompetitionOrganiserInfo.liveStreamingUrl,
          resultsUrl: response.data.getCompetitionOrganiserInfo.resultsPageUrl,
          websiteUrl: response.data.getCompetitionOrganiserInfo.websiteUrl,
          events: JSON.parse(JSON.stringify(Object.fromEntries(events))),
          contactPersons: response.data.getCompetitionOrganiserInfo.contactPersons.map(
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
      }
      return null;
  }

  // competitionGroupId: Int | null
  // disciplineId: Int | null
  // regionType: "area","world", "country"
  // regionId: Int | null
  // rankingCategoryId: Int | null
  // permitLevelId: Int | null
  // query: "rehlingen"
  async findCompetitions(
    {
      competitionGroupId= null,
      disciplineId= null,
      regionType = null,
      regionId = null,
      rankingCategoryId = null,
      permitLevelId = null,
      query = null,
    }: {
      competitionGroupId?: number | null;
      disciplineId?: number | null;
      regionType?: string;
      regionId?: number | null;
      rankingCategoryId?: number | null;
      permitLevelId?: number | null;
      query?: string;
    }
  ): Promise<Competition[]> {
      const data = await this.graphQLClient.request(COMPETITION_CALENDAR,
        {
          competitionGroupId,
          disciplineId,
          regionType,
          regionId,
          rankingCategoryId,
          permitLevelId,
          query,
        }
      );
      const response = z
        .object({
          getCalendarEvents: z.object({
            results: z.array(CompetitionSchema),
          })
        })
        .safeParse(data);
      if(response.success){
        return response.data.getCalendarEvents.results.map((result) => {
          return {
            id: result.id,
            name: result.name,
            location: parseVenue(result.venue),
            area: result.area,
            rankingCategory: result.rankingCategory,
            disciplines: result.disciplines ? result.disciplines.split(',').map((discipline) => discipline.trim()) : [],
            startDate: result.startDate,
            endDate: result.endDate,
            competitionGroup: result.competitionGroup,
            competitionSubgroup: result.competitionSubgroup,
            hasResults: result.hasResults,
            hasStartlist: result.hasStartlist,
            hasCompetitionInformation: result.hasCompetitionInformation,
          };
        });
      }
      return [];
  }
}
