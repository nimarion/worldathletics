import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import RESULTS_QUERY from './result.query';
import { ResultsByEvent } from './result.zod';
import { Performance } from '../athlete.dto';
import mapDisciplineToCode from 'src/discipline.utils';
import { GraphqlService } from 'src/graphql/graphql.service';
import { toPerformance } from 'src/performance-conversion';

@Injectable()
export class ResultsService {
  constructor(private readonly graphqlService: GraphqlService) {}

  async getResultsFromAthlete(
    id: number,
    year?: number,
  ): Promise<Performance[] | null> {
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
    return results.filter((result) => result.place && result.place > 0);
  }
}
