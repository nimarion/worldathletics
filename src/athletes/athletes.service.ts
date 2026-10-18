import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { z } from 'zod';
import { Athlete, AthleteSearchResult } from './athlete.dto';
import ATHLETE_QUERY, { ATHLETE_SEARCH_QUERY } from './athlete.query';
import { Athlete as AthleteSchema, AthleteSearchSchema } from './athlete.zod';
import { GraphqlService } from 'src/graphql/graphql.service';
import { levenshteinDistance } from 'src/levenshtein-distance';
import {
  toPerformance,
  toPerformanceFields,
} from 'src/performance-conversion';

@Injectable()
export class AthletesService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly graphqlService: GraphqlService,
  ) {}

  async searchAthlete(name: string): Promise<AthleteSearchResult[]> {
    const data = await this.graphqlService
      .getClient()
      .request(ATHLETE_SEARCH_QUERY, {
        name,
      });
    const response = z
      .object({
        searchCompetitors: z.array(AthleteSearchSchema),
      })
      .parse(data);
    return response.searchCompetitors
      .filter(
        (item): item is typeof item & { aaAthleteId: number } =>
          item.aaAthleteId !== null,
      )
      .map((item) => {
        return {
          id: item.aaAthleteId,
          country: item.country,
          firstname: item.givenName,
          lastname: item.familyName,
          birthdate: item.birthDate ? item.birthDate.date : null,
          birthdateOnlyYear: item.birthDate
            ? item.birthDate.birthdateOnlyYear
            : false,
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
    const cacheKey = `athlete:${id}`;
    const cached = await this.cacheManager.get<Athlete>(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await this.graphqlService.getClient().request(
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
      ? basicData.sexNameUrlSlug
      : worldRankingSex;

    const athlete = {
      id,
      firstname,
      lastname,
      birthdate: birthdate ? birthdate.date : null,
      birthdateOnlyYear: birthdate ? birthdate.birthdateOnlyYear : false,
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
      seasonsbests: seasonsBests.results.map((result) =>
        toPerformance(result),
      ),
      personalbests: personalBests.results.map((result) =>
        toPerformance(result),
      ),
      honours: honours.map((honour) => {
        return {
          category: honour.categoryName,
          results: honour.results.map((result) => ({
            ...toPerformanceFields({
              discipline: result.discipline,
              mark: result.mark,
            }),
            date: result.date,
            location: result.venue,
            competition: result.competition,
            place: result.place,
            competitionId: result.competitionId,
            eventId: result.eventId,
          })),
        };
      }),
    };

    await this.cacheManager.set(cacheKey, athlete, 15 * 60 * 1000); // cache for 15 minutes (900000ms)
    return athlete;
  }
}
