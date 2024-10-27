import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { GraphqlService } from 'src/graphql/graphql.service';
import { COMPETITION_CALENDAR, COMPETITION_ORGANISER, COMPETITON_RESULTS } from './competition.query';
import { z } from 'zod';
import { Competition, CompetitionOrganiserInfo } from './competition.dto';
import parsePhoneNumber from 'libphonenumber-js';
import { CompetitionOrganiserInfoSchema, CompetitionSchema } from './competition.zod';
import { parseVenue } from 'src/utils';
import { PlaceSchema, WindSchema } from 'src/athletes/athlete.zod';

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
            rankingCategory: result.rankingCategory,
            disciplines: result.disciplines ? result.disciplines.split(',').map((discipline) => discipline.trim()) : [],
            start: result.startDate,
            end: result.endDate,
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

  async findCompetitionResults(competitionId: number): Promise<any> {
    const data = await this.graphQLClient.request(COMPETITON_RESULTS,
      {
        competitionId,
      }
    );
    const response = z
      .object({
        getCalendarCompetitionResults: z.object({
          eventTitles: z.array(
            z.object({ 
              rankingCategory: z.string(),
              eventTitle: z.string().nullable(),
              events: z.array(z.object({
                event: z.string(),
                eventId: z.number(),
                gender: z.string(),
                isRelay: z.boolean(),
                perResultWind: z.boolean(),
                withWind: z.boolean(),
                races: z.array(z.object({
                  date: z.string().nullable(),
                  day: z.number().nullable(),
                  race: z.string(),
                  raceId: z.number(),
                  raceNumber: z.number(),
                  results: z.array(z.object({
                    competitor: z.object({
                      teamMembers: z.array(z.object({
                        id: z.number().nullable(),
                        name: z.string(),
                        urlSlug: z.string().nullable(),
                      })).nullable(),
                      name: z.string(),
                      urlSlug: z.string().nullable(),
                      birthDate: z.string().nullable(),
                    }),
                    mark: z.string(),
                    nationality: z.string(),
                    place: PlaceSchema,
                    points: z.any().nullable(),
                    qualified: z.any().nullable(),
                    records: z.string(),
                    wind: WindSchema,
                    remark: z.any().nullable(),
                    details: z.any().nullable(),
                  })),
                  startlist: z.any().nullable(),
                  wind: WindSchema,
                }))
            }))
         })),
          options: z.object({
            days: z.array(z.object({
              date: z.string().transform((val) => {
                if (!val) return null;
                const date = new Date(val);
                date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                return date;
              }),
              day: z.number(),
            })),
            events: z.array(z.object({
              gender: z.string(),
              id: z.number(),
              name: z.string(),
              combined: z.boolean().nullable().default(false),
            })),
          })
        })
      })
      .safeParse(data);
    if(response.success){
      return response.data.getCalendarCompetitionResults;
    }
    console.log(response.error);
    return null;
  }
}
