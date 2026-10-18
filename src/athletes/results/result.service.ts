import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { z } from 'zod';
import RESULTS_QUERY from './result.query';
import { ResultsByEvent } from './result.zod';
import { Performance } from '../athlete.dto';
import mapDisciplineToCode from 'src/discipline.utils';
import { GraphqlService } from 'src/graphql/graphql.service';
import { toPerformance } from 'src/performance-conversion';

@Injectable()
export class ResultsService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly graphqlService: GraphqlService,
  ) {}

  async getResultsFromAthlete(
    id: number,
    year?: number,
  ): Promise<Performance[] | null> {
    const cacheKey = `athlete_results:${id}:${year ?? 'latest'}`;
    const cached = await this.cacheManager.get<Performance[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await this.graphqlService.getClient().request(
      RESULTS_QUERY,
      {
        id: String(id),
        year: year,
      },
      {
        'x-athlete-id': String(id),
      },
    );
    const response = z
      .object({
        getSingleCompetitorResultsDiscipline: ResultsByEvent.nullable(),
      })
      .parse(data);
    if (!response.getSingleCompetitorResultsDiscipline) {
      return null;
    }
    const results: Performance[] = [];
    response.getSingleCompetitorResultsDiscipline.resultsByEvent.forEach(
      (event) => {
        const discipline = event.discipline;
        const disciplineCode = mapDisciplineToCode(discipline);
        event.results.forEach((result) => {
          results.push(
            toPerformance({
              ...result,
              discipline,
              disciplineCode,
              records: [],
            }),
          );
        });
      },
    );
    const filteredResults = results.filter(
      (result) => result.place && result.place > 0,
    );

    const currentYear = new Date().getFullYear();
    const ttl =
      year && year < currentYear ? 24 * 60 * 60 * 1000 : 15 * 60 * 1000;
    await this.cacheManager.set(cacheKey, filteredResults, ttl);

    return filteredResults;
  }
}
