import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { GraphqlService } from 'src/graphql/graphql.service';
import {
  COMPETITION_CALENDAR,
  COMPETITION_ORGANISER,
  COMPETITON_RESULTS,
} from './competition.query';
import { date, z } from 'zod';
import {
  Competition,
  CompetitionOrganiserInfo,
  CompetitionResult,
  CompetitionResultEvent,
  CompetitionResults,
} from './competition.dto';
import {
  CompetitionOrganiserInfoSchema,
  CompetitionSchema,
} from './competition.zod';
import {
  formatSex,
  isShortTrack,
  parsePhoneNumber,
  parseVenue,
} from 'src/utils';
import mapDisciplineToCode, {
  cleanupDiscipline,
  isTechnical,
} from 'src/discipline.utils';
import {
  DateSchema,
  FullnameSchema,
  MarkSchema,
  PlaceSchema,
  UrlSlugIdSchema,
} from 'src/zod.schema';
import { Sex } from 'src/athletes/athlete.dto';
import { performanceToFloat } from 'src/performance-conversion';

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
    const events = new Map<Sex, string[]>();
    response.getCompetitionOrganiserInfo.units.forEach((unit) => {
      const disciplines: string[] = [];
      unit.events.forEach((event) => {
        disciplines.push(event);
      });
      if (unit.gender) {
        events.set(unit.gender, disciplines);
      }
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
            phone: parsePhoneNumber(contact.phoneNumber),
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
    regionType = undefined,
    regionId = null,
    rankingCategoryId = null,
    permitLevelId = null,
    query = undefined,
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
    day = undefined,
  }: {
    competitionId: number;
    eventId?: number;
    day?: number
  }): Promise<CompetitionResults> {
    const data = await this.graphQLClient.request(COMPETITON_RESULTS, {
      competitionId,
      eventId,
      day
    });
    const response = z
      .object({
        getCalendarCompetitionResults: z.object({
          competition: z.object({
            venue: z.string(),
            name: z.string(),
          }),
          parameters: z.object({
            day: z.number().nullable(),
          }),
          eventTitles: z.array(
            z.object({
              rankingCategory: z.string(),
              eventTitle: z.string().nullable(),
              events: z.array(
                z.object({
                  event: z.string().transform(cleanupDiscipline),
                  eventId: z.coerce.number(),
                  gender: z.string(),
                  isRelay: z.boolean(),
                  perResultWind: z.boolean(),
                  withWind: z.boolean(),
                  races: z.array(
                    z.object({
                      date: z.nullable(DateSchema),
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
                            urlSlug: z.nullable(UrlSlugIdSchema),
                            birthDate: z.nullable(DateSchema),
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
                          wind: z.coerce
                            .number()
                            .nullable()
                            .catch(() => null),
                          //remark: z.any().nullable(),
                          details: z.any().nullable(),
                        }),
                      ),
                      startlist: z.any().nullable(),
                      wind: z.coerce
                        .number()
                        .nullable()
                        .catch(() => null),
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
                gender: z.string().transform(formatSex),
                id: z.number(),
                name: z.string().transform(cleanupDiscipline),
                combined: z.boolean().nullable().transform((val) => {
                  return val === null ? false : val;
                }),
              }),
            ),
          }),
        }),
      })
      .parse(data);
    
    const competitionDate = response.getCalendarCompetitionResults.options.days.find((d) => d.day === response.getCalendarCompetitionResults.parameters.day)?.date ||  null;

    const competitionResults: CompetitionResultEvent[] = response.getCalendarCompetitionResults.eventTitles.flatMap((event) => {
      const category = event.rankingCategory;
      const eventName = event.eventTitle;
      const data: CompetitionResultEvent[] = event.events.map((event) => {
          const technical = isTechnical({
            disciplineCode: mapDisciplineToCode(event.event),
            performance: event.races[0].results[0].mark,
          });
          return {
            eventName,
            category,
            eventId: event.eventId,
            isRelay: event.isRelay,
            sex: formatSex(event.gender),
            disciplineCode: mapDisciplineToCode(event.event),
            discipline: event.event,
            shortTrack: isShortTrack(event.event),
            isTechnical: technical,
            races: event.races.map((race) => {
              const results: CompetitionResult[] = race.results.map(
                (result) => {
                  const athletes = result.competitor.teamMembers
                    ? result.competitor.teamMembers.map((teamMember) => {
                        return {
                          id: teamMember.id,
                          firstname: teamMember.name!!.firstname,
                          lastname: teamMember.name!!.lastname,
                          birthdate: null,
                        };
                      })
                    : [
                        {
                          id: result.competitor.urlSlug,
                          firstname: result.competitor.name!!.firstname,
                          lastname: result.competitor.name!!.lastname,
                          birthdate: result.competitor.birthDate,
                        },
                      ];
                  return {
                    location: parseVenue(response.getCalendarCompetitionResults.competition.venue),
                    disciplineCode: mapDisciplineToCode(event.event),
                    discipline: event.event,
                    date: race.date || competitionDate || null,
                    isTechnical: technical,
                    shortTrack: isShortTrack(event.event),
                    place: result.place,
                    mark: result.mark,
                    wind: event.perResultWind ? result.wind : race.wind,
                    performanceValue: performanceToFloat({
                      performance: result.mark,
                      technical,
                    }),
                    country: result.nationality,
                    athletes,
                  };
                },
              );
              return {
                date: race.date || competitionDate || null,
                day: race.day || day || null,
                race: race.race,
                raceId: race.raceId,
                raceNumber: race.raceNumber,
                results,
              };
            }),
          };
        });
      return data;
    });
    return {
      events: competitionResults,
      options: {
        days: response.getCalendarCompetitionResults.options.days,
        events: response.getCalendarCompetitionResults.options.events.map(
          (event) => {
            return {
              id: event.id,
              name: event.name,
              disciplineCode: mapDisciplineToCode(event.name),
              combined: event.combined,
              discipline: event.name,
              sex: event.gender,
              shortTrack: isShortTrack(event.name),
            }
          }
        )
      }
    }
  }
}
