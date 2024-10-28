import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { z } from 'zod';
import RESULTS_QUERY from './result.query';
import { ResultsByEvent } from './result.zod';
import { Performance } from '../athlete.dto';
import mapDisciplineToCode, { isTechnical } from 'src/discipline.utils';
import { GraphqlService } from 'src/graphql/graphql.service';
import { performanceToFloat } from 'src/performance-conversion';
import { isShortTrack, parseVenue } from 'src/utils';

@Injectable()
export class ResultsService {
  private graphQLClient: GraphQLClient;
  constructor(private readonly graphqlService: GraphqlService) {
    this.graphQLClient = this.graphqlService.getClient();
  }

  async getResultsFromAthlete(
    id: number,
    year?: number,
  ): Promise<Performance[] | null> {
      const data = await this.graphQLClient.request(
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
            const location = parseVenue(result.venue);
            results.push({
              category: result.category,
              competition: result.competition,
              date: result.date,
              discipline,
              disciplineCode,
              shortTrack: isShortTrack(discipline),
              place: result.place,
              resultScore: result.resultScore,
              wind: result.wind,
              mark: result.mark,
              performanceValue: performanceToFloat({
                performance: result.mark,
                technical: isTechnical({
                  disciplineCode,
                  performance: result.mark,
                }),
              }),
              legal: !result.notLegal,
              location,
              race: result.race,
              records: null,
              competitionId: result.competitionId,
              eventId: result.eventId,
            });
          });
        },
      );
      return results.filter((result) => result.place > 0);
  }
}
