import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { z } from 'zod';
import RESULTS_QUERY from './result.query';
import { ResultsByEvent } from './result.zod';
import { Performance } from '../athlete.dto';

@Injectable()
export class ResultsService {
  private graphQLClient: GraphQLClient;
  constructor() {
    this.graphQLClient = new GraphQLClient(process.env.STELLATE_ENDPOINT);
  }

  async getResultsFromAthlete(
    id: number,
    year?: number,
  ): Promise<Performance[] | null> {
    try {
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
          const indoor = event.indoor;
          const discipline = event.discipline;
          const disciplineCode = event.disciplineCode;
          event.results.forEach((result) => {
            results.push({
              category: result.category,
              competition: result.competition,
              date: result.date,
              discipline,
              disciplineCode,
              indoor,
              place: result.place,
              resultScore: result.resultScore,
              wind: result.wind,
              mark: result.mark,
              legal: !result.notLegal,
              venue: result.venue,
              country: result.country,
              race: result.race,
              records: null,
            });
          });
        },
      );
      return results;
    } catch (error) {
      console.log(error);
    }
  }
}
