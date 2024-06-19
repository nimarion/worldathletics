import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { z } from 'zod';
import * as Sentry from '@sentry/node';
import { Athlete, AthleteSearchResult } from './athlete.dto';
import ATHLETE_QUERY, { ATHLETE_SEARCH_QUERY } from './athlete.query';
import { Athlete as AthleteSchema, AthleteSearchSchema } from './athlete.zod';
import parseVenue from './venue.utils';
import mapDisciplineToCode, { isTechnical } from 'src/discipline.utils';
import { formatLastname } from 'src/name.utils';
import { GraphqlService } from 'src/graphql/graphql.service';
import { levenshteinDistance } from 'src/levenshtein-distance';
import { performanceToFloat } from 'src/performance-conversion';

@Injectable()
export class AthletesService {
  private graphQLClient: GraphQLClient;
  constructor(private readonly graphqlService: GraphqlService) {
    this.graphQLClient = this.graphqlService.getClient();
  }

  async searchAthlete(name: string): Promise<AthleteSearchResult[] | null> {
    try {
      const data = await this.graphQLClient.request(ATHLETE_SEARCH_QUERY, {
        name,
      });
      const response = z
        .object({
          searchCompetitors: z.array(AthleteSearchSchema),
        })
        .parse(data);
      const searchResults = response.searchCompetitors.map((item) => {
        const sex =
          item.gender === 'Men'
            ? 'MALE'
            : item.gender === 'Women'
              ? 'FEMALE'
              : null;
        return {
          id: Number(item.aaAthleteId),
          country: item.country,
          firstname: item.givenName,
          lastname: formatLastname(item.familyName),
          birthdate: item.birthDate,
          levenshteinDistance: levenshteinDistance(
            name.toLowerCase().trim(),
            (item.givenName + ' ' + item.familyName).toLowerCase().trim(),
          ),
          sex,
        };
      }) as AthleteSearchResult[];
      return searchResults.sort(
        (a, b) => a.levenshteinDistance - b.levenshteinDistance,
      );
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
    }
    return null;
  }

  async getAthlete(id: number): Promise<Athlete | null> {
    try {
      const data = await this.graphQLClient.request(
        ATHLETE_QUERY,
        {
          id: String(id),
        },
        {
          'x-athlete-id': String(id),
        },
      );
      const response = z
        .object({
          getSingleCompetitor: AthleteSchema.nullable(),
        })
        .parse(data);
      if (!response.getSingleCompetitor) {
        return null;
      }
      const lastname = formatLastname(
        response.getSingleCompetitor.basicData.familyName,
      );

      const worldRankingSex =
        response.getSingleCompetitor.worldRankings.best.length > 0
          ? response.getSingleCompetitor.worldRankings.best[0].eventGroup
              .toLowerCase()
              .includes('women')
            ? 'FEMALE'
            : 'MALE'
          : null;

      return {
        id,
        firstname: response.getSingleCompetitor.basicData.givenName,
        lastname,
        birthdate: response.getSingleCompetitor.basicData.birthDate,
        country: response.getSingleCompetitor.basicData.countryCode,
        sex: response.getSingleCompetitor.basicData.sexNameUrlSlug
          ? response.getSingleCompetitor.basicData.sexNameUrlSlug === 'women'
            ? 'FEMALE'
            : 'MALE'
          : worldRankingSex,
        athleteRepresentativeId:
          response.getSingleCompetitor.athleteRepresentative?._id ?? null,
        activeSeasons: response.getSingleCompetitor.seasonsBests.activeSeasons,
        currentWorldRankings:
          response.getSingleCompetitor.worldRankings.current.map((ranking) => {
            return {
              eventGroup: ranking.eventGroup,
              place: ranking.place,
            };
          }),
        seasonsbests: response.getSingleCompetitor.seasonsBests.results
          .filter((result) => {
            const diff = new Date().getTime() - result.date.getTime();
            const diffInMonths = diff / (1000 * 3600 * 24 * 30);
            return diffInMonths < 12;
          })
          .map((result) => {
            const location = parseVenue(result.venue);
            const indoor = result.venue.endsWith('(i)');
            result.venue = result.venue.replace(' (i)', '');
            const disciplineCode = mapDisciplineToCode(result.discipline);
            result.mark = result.mark.replace(/[^0-9:.]/g, '');
            return {
              date: result.date,
              discipline: result.discipline,
              disciplineCode,
              shortTrack: result.discipline.endsWith('Short Track'),
              mark: result.mark,
              performanceValue: performanceToFloat({
                performance: result.mark,
                technical: isTechnical({
                  disciplineCode,
                  performance: result.mark,
                }),
              }),
              venue: result.venue,
              location,
              indoor,
              legal: !result.notLegal,
              resultScore: result.resultScore,
              wind: result.wind,
              competition: null,
              category: null,
              race: null,
              place: null,
              records: result.records,
              competitionId: result.competitionId,
              eventId: result.eventId,
            };
          }),
        personalbests: response.getSingleCompetitor.personalBests.results.map(
          (result) => {
            const location = parseVenue(result.venue);
            const indoor = result.venue.endsWith('(i)');
            result.venue = result.venue.replace(' (i)', '');
            result.mark = result.mark.replace(/[^0-9:.]/g, '');
            const disciplineCode = mapDisciplineToCode(result.discipline);
            return {
              date: result.date,
              discipline: result.discipline,
              disciplineCode,
              shortTrack: result.discipline.endsWith('Short Track'),
              mark: result.mark,
              performanceValue: performanceToFloat({
                performance: result.mark,
                technical: isTechnical({
                  disciplineCode,
                  performance: result.mark,
                }),
              }),
              venue: result.venue,
              location,
              indoor,
              legal: !result.notLegal,
              resultScore: result.resultScore,
              wind: result.wind,
              competition: null,
              category: null,
              race: null,
              place: null,
              records: result.records,
              competitionId: result.competitionId,
              eventId: result.eventId,
            };
          },
        ),
        honours: response.getSingleCompetitor.honours.map((honour) => {
          return {
            category: honour.categoryName,
            results: honour.results.map((result) => {
              const indoor = result.venue.endsWith('(i)');
              result.venue = result.venue.replace(' (i)', '');
              const disciplineCode = mapDisciplineToCode(result.discipline);
              result.mark = result.mark.replace(/[^0-9:.]/g, '');
              return {
                date: result.date,
                discipline: result.discipline,
                disciplineCode,
                shortTrack: result.discipline.endsWith('Short Track'),
                mark: result.mark,
                performanceValue: performanceToFloat({
                  performance: result.mark,
                  technical: isTechnical({
                    disciplineCode,
                    performance: result.mark,
                  }),
                }),
                venue: result.venue,
                location: parseVenue(result.venue),
                indoor,
                competition: result.competition,
                place: result.place,
                competitionId: result.competitionId,
                eventId: result.eventId,
              };
            }),
          };
        }),
      };
    } catch (error) {
      console.error(error);
      Sentry.withScope((scope) => {
        scope.setExtra('id', id);
        Sentry.captureException(error);
      });
    }
    return null;
  }
}
