import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { z } from 'zod';
import { Athlete, AthleteSearchResult, Performance, Sex } from './athlete.dto';
import ATHLETE_QUERY, { ATHLETE_SEARCH_QUERY } from './athlete.query';
import { Athlete as AthleteSchema, AthleteSearchSchema } from './athlete.zod';
import mapDisciplineToCode, { isTechnical } from 'src/discipline.utils';
import { GraphqlService } from 'src/graphql/graphql.service';
import { levenshteinDistance } from 'src/levenshtein-distance';
import { performanceToFloat } from 'src/performance-conversion';

@Injectable()
export class AthletesService {
  private graphQLClient: GraphQLClient;
  constructor(private readonly graphqlService: GraphqlService) {
    this.graphQLClient = this.graphqlService.getClient();
  }

  async searchAthlete(name: string): Promise<AthleteSearchResult[]> {
    const data = await this.graphQLClient.request(ATHLETE_SEARCH_QUERY, {
      name,
    });
    const response = z
      .object({
        searchCompetitors: z.array(AthleteSearchSchema),
      })
      .parse(data);
    return response.searchCompetitors
      .map((item) => {
        if (!item.aaAthleteId) {
          throw new Error('Athlete ID is missing');
        }
        return {
          id: item.aaAthleteId,
          country: item.country,
          firstname: item.givenName,
          lastname: item.familyName,
          birthdate: item.birthDate,
          levenshteinDistance: levenshteinDistance(
            name.toLowerCase().trim(),
            (item.givenName + ' ' + item.familyName).toLowerCase().trim(),
          ),
          sex: item.gender,
        };
      })
      .sort((a, b) => a.levenshteinDistance - b.levenshteinDistance);
  }

  async getAthlete(id: number): Promise<Athlete | null> {
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
    const {
      basicData,
      worldRankings,
      seasonsBests,
      personalBests,
      honours,
      athleteRepresentative,
    } = response.getSingleCompetitor;
    const {
      givenName: firstname,
      familyName: lastname,
      countryCode: country,
      birthDate: birthdate,
    } = basicData;

    const worldRankingSex =
      worldRankings.best.length > 0
        ? worldRankings.best[0].eventGroup.toLowerCase().includes('women')
          ? 'W'
          : 'M'
        : null;
    const sex = basicData.sexNameUrlSlug
      ? basicData.sexNameUrlSlug === 'women'
        ? 'W'
        : 'M'
      : worldRankingSex;

    function resultToPerformance(
      result: (typeof seasonsBests.results)[0],
    ): Performance {
      const disciplineCode = mapDisciplineToCode(result.discipline);
      const technical = isTechnical({
        disciplineCode,
        performance: result.mark,
      });
      return {
        date: result.date,
        discipline: result.discipline,
        disciplineCode,
        mark: result.mark,
        performanceValue: performanceToFloat({
          performance: result.mark,
          technical,
        }),
        isTechnical: technical,
        location: result.venue,
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
    }

    return {
      id,
      firstname,
      lastname,
      birthdate,
      country,
      sex,
      athleteRepresentativeId: athleteRepresentative,
      activeSeasons: seasonsBests.activeSeasons,
      currentWorldRankings: worldRankings.current.map((ranking) => {
        return {
          eventGroup: ranking.eventGroup,
          place: ranking.place,
        };
      }),
      seasonsbests: seasonsBests.results.map(resultToPerformance),
      personalbests: personalBests.results.map(resultToPerformance),
      honours: honours.map((honour) => {
        return {
          category: honour.categoryName,
          results: honour.results.map((result) => {
            const disciplineCode = mapDisciplineToCode(result.discipline);
            const technical = isTechnical({
              disciplineCode,
              performance: result.mark,
            });
            return {
              date: result.date,
              discipline: result.discipline,
              disciplineCode,
              mark: result.mark,
              performanceValue: performanceToFloat({
                performance: result.mark,
                technical,
              }),
              isTechnical: technical,
              location: result.venue,
              competition: result.competition,
              place: result.place,
              competitionId: result.competitionId,
              eventId: result.eventId,
            };
          }),
        };
      }),
    };
  }
}
