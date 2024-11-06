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
  CompetitionResult,
  CompetitionResultEvent,
  CompetitionResults,
} from './competition.dto';
import {
  CompetitionOrganiserInfoSchema,
  CompetitionResultsSchema,
  CompetitionSchema,
} from './competition.zod';
import mapDisciplineToCode, {
  isTechnical,
} from 'src/discipline.utils';
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
      events.set(unit.gender, disciplines);
    });
    const prizeMoney = new Map<Sex, number[]>();
    response.getCompetitionOrganiserInfo.prizeMoney.forEach((prize) => {
      const prizes: number[] = [];
      prize.prizes.forEach((p) => {
        prizes.push(p);
      });
      prizeMoney.set(prize.gender, prizes);
    });

    return {
      liveStreamUrl: response.getCompetitionOrganiserInfo.liveStreamingUrl,
      resultsUrl: response.getCompetitionOrganiserInfo.resultsPageUrl,
      websiteUrl: response.getCompetitionOrganiserInfo.websiteUrl,
      additionalInfo: response.getCompetitionOrganiserInfo.additionalInfo,
      events,
      prizeMoney,
      contactPersons: response.getCompetitionOrganiserInfo.contactPersons.map(
        (contact) => {
          return {
            email: contact.email,
            name: contact.name,
            phone: contact.phoneNumber,
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
        location: result.venue,
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
        getCalendarCompetitionResults:CompetitionResultsSchema,
      })
      .parse(data);
    
    const competitionDate = response.getCalendarCompetitionResults.options.days.find((d) => d.day === response.getCalendarCompetitionResults.parameters.day)?.date ||  null;
    const competitionDay = response.getCalendarCompetitionResults.parameters.day || undefined;

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
            sex: event.gender,
            disciplineCode: mapDisciplineToCode(event.event),
            discipline: event.event,
            isTechnical: technical,
            races: event.races.map((race) => {
              const date =  race.date || competitionDate || null;
              const day = race.day || competitionDay || null;
              const results: CompetitionResult[] = race.results.map(
                (result) => {
                  const athletes = result.competitor.teamMembers
                    ? result.competitor.teamMembers.map((teamMember) => {
                        return {
                          id: teamMember.id,
                          firstname: teamMember.name!!.firstname,
                          lastname: teamMember.name!!.lastname,
                          birthdate: null,
                          country: teamMember.urlSlug.country,
                          sex: event.gender != "X" ? event.gender : null,
                        };
                      })
                    : [
                        {
                          id: result.competitor.urlSlug!!.id,
                          firstname: result.competitor.name!!.firstname,
                          lastname: result.competitor.name!!.lastname,
                          birthdate: result.competitor.birthDate,
                          country: result.nationality || result.competitor.urlSlug!!.country,
                          sex: event.gender != "X" ? event.gender : null,
                        },
                      ];
                  return {
                    location: response.getCalendarCompetitionResults.competition.venue,
                    disciplineCode: mapDisciplineToCode(event.event),
                    discipline: event.event,
                    date: race.date || competitionDate || null,
                    isTechnical: technical,
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
                date,
                day,
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
            }
          }
        )
      }
    }
  }
}
