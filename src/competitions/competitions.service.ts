import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { GraphqlService } from 'src/graphql/graphql.service';
import {
  COMPETITION_CALENDAR,
  COMPETITION_ORGANISER,
  COMPETITON_RESULTS,
} from './competition.query';
import { z } from 'zod';
import {
  Competition,
  CompetitionOrganiserInfo,
  CompetitionResults,
} from './competition.dto';
import parsePhoneNumber from 'libphonenumber-js';
import {
  CompetitionOrganiserInfoSchema,
  CompetitionSchema,
} from './competition.zod';
import { parseVenue } from 'src/utils';
import mapDisciplineToCode from 'src/discipline.utils';
import {
  DateSchema,
  FullnameSchema,
  MarkSchema,
  PlaceSchema,
  StringNumberSchema,
  UrlSlugIdSchema,
} from 'src/zod.schema';

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
            phone: parsePhoneNumber(contact.phoneNumber).formatInternational(),
            role: contact.title,
          };
        },
      ),
    };
  }

  // competitionGroupId: Int | null
  // disciplineId: Int | null
  // regionType: "area","world", "country"
  // regionId: Int | null
  // rankingCategoryId: Int | null
  // permitLevelId: Int | null
  // query: "rehlingen"
  async findCompetitions({
    competitionGroupId = null,
    disciplineId = null,
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
  }): Promise<Competition[]> {
    const data = await this.graphQLClient.request(COMPETITION_CALENDAR, {
      competitionGroupId,
      disciplineId,
      regionType,
      regionId,
      rankingCategoryId,
      permitLevelId,
      query,
    });
    const response = z
      .object({
        getCalendarEvents: z.object({
          results: z.array(CompetitionSchema),
        }),
      })
      .parse(data);
    return response.getCalendarEvents.results.map((result) => {
      return {
        id: result.id,
        name: result.name,
        location: parseVenue(result.venue),
        rankingCategory: result.rankingCategory,
        disciplines: result.disciplines,
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

  async findCompetitionResults({
    competitionId,
    eventId = undefined,
  }: {
    competitionId: number;
    eventId?: number;
  }): Promise<CompetitionResults[]> {
    const data = await this.graphQLClient.request(COMPETITON_RESULTS, {
      competitionId,
      eventId,
    });
    const response = z
      .object({
        getCalendarCompetitionResults: z.object({
          eventTitles: z.array(
            z.object({
              rankingCategory: z.string(),
              eventTitle: z.string().nullable(),
              events: z.array(
                z.object({
                  event: z.string(),
                  eventId: StringNumberSchema,
                  gender: z.string(),
                  isRelay: z.boolean(),
                  perResultWind: z.boolean(),
                  withWind: z.boolean(),
                  races: z.array(
                    z.object({
                      date: z.string().nullable(),
                      day: z.number().nullable(),
                      race: z.string(),
                      raceId: z.number(),
                      raceNumber: z.number(),
                      results: z.array(
                        z.object({
                          competitor: z.object({
                            teamMembers: z
                              .array(
                                z.object({
                                  id: z.number().nullable(),
                                  name: FullnameSchema,
                                }),
                              )
                              .nullable(),
                            name: FullnameSchema,
                            urlSlug: UrlSlugIdSchema,
                            birthDate: DateSchema,
                          }),
                          mark: MarkSchema,
                          nationality: z.string(),
                          place: PlaceSchema,
                          records: z.string().transform((val) => {
                            if (val === '') return [];
                            return val
                              .split(',')
                              .map((record) => record.trim());
                          }),
                          wind: StringNumberSchema,
                          //remark: z.any().nullable(),
                          details: z.any().nullable(),
                        }),
                      ),
                      startlist: z.any().nullable(),
                      wind: StringNumberSchema,
                    }),
                  ),
                }),
              ),
            }),
          ),
          options: z.object({
            days: z.array(
              z.object({
                date: DateSchema,
                day: z.number(),
              }),
            ),
            events: z.array(
              z.object({
                gender: z.string(),
                id: z.number(),
                name: z.string(),
                combined: z.boolean().nullable().default(false),
              }),
            ),
          }),
        }),
      })
      .parse(data);
    return response.getCalendarCompetitionResults.eventTitles.map((event) => {
      return {
        name: event.eventTitle,
        rankingCategory: event.rankingCategory,
        events: event.events.map((event) => {
          return {
            ...event,
            disciplineCode: mapDisciplineToCode(event.event),
            races: event.races.map((race) => {
              return {
                ...race,
                results: race.results.map((result) => {
                  const athletes = result.competitor.teamMembers
                    ? result.competitor.teamMembers.map((teamMember) => {
                        return {
                          id: teamMember.id,
                          ...teamMember.name,
                        };
                      })
                    : [
                        {
                          id: result.competitor.urlSlug,
                          ...result.competitor.name,
                          birthDate: result.competitor.birthDate,
                        },
                      ];
                  return {
                    ...result,
                    country: result.nationality,
                    athletes,
                  };
                }),
              };
            }),
          };
        }),
      };
    });
  }
}
