import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import * as Sentry from '@sentry/node';
import { GraphqlService } from 'src/graphql/graphql.service';
import { RECORD_QUERY } from './record.query';
import { z } from 'zod';
import { formatLastname } from 'src/name.utils';
import { Record } from './record.entity';

export const CompetitionOrganiserInfoSchema = z.object({
  gender: z.enum(['women', 'men', 'mixed']),
  results: z.array(
    z.object({
      country: z.string(),
      discipline: z.string(),
      date: z.string(),
      performance: z.string(),
      venue: z.string(),
      wind: z
        .preprocess((val) => {
          if (!val) return null;
          if (isNaN(Number(val))) return null;
          return Number(val);
        }, z.number().nullable())
        .nullable(),
      pending: z.boolean(),
      mixed: z.boolean(),
      setIndoor: z.boolean(),
      competitor: z.object({
        name: z.string(),
        country: z.string().nullable(),
        birthDate: z.string().nullable(),
        id: z.number().nullable(),
        teamMembers: z
          .array(
            z.object({
              name: z.string(),
              country: z.string(),
              birthDate: z.string().nullable(),
              id: z.number().nullable(),
            }),
          )
          .nullable(),
      }),
    }),
  ),
});

@Injectable()
export class RecordsService {
  private graphQLClient: GraphQLClient;
  constructor(private readonly graphqlService: GraphqlService) {
    this.graphQLClient = this.graphqlService.getClient();
  }

  async find(category: number): Promise<Record[]> {
    const records: Record[] = [];
    try {
      const data = await this.graphQLClient.request(RECORD_QUERY, {
        categoryId: category,
      });
      const response = z
        .object({
          getRecordsDetailByCategory: z.array(CompetitionOrganiserInfoSchema),
        })
        .parse(data);

      response.getRecordsDetailByCategory.forEach((record) => {
        record.results.forEach((result) => {
          const athletes = result.competitor.teamMembers
            ? result.competitor.teamMembers
            : [result.competitor];
          records.push({
            gender: record.gender,
            discipline: result.discipline,
            date: new Date(result.date),
            shortTrack: result.discipline.endsWith('Short Track'),
            pending: result.pending,
            mark: result.performance,
            wind: result.wind,
            indoor: result.setIndoor,
            athletes: athletes.map((competitor) => ({
              firstname: competitor.name.split(' ')[0],
              lastname: formatLastname(competitor.name.split(' ')[1]),
              country: competitor.country,
              birthdate: competitor.birthDate
                ? new Date(competitor.birthDate)
                : null,
              id: competitor.id,
            })),
          });
        });
      });
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
    }
    return records;
  }
}
