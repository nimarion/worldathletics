import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import * as Sentry from '@sentry/node';
import { GraphqlService } from 'src/graphql/graphql.service';
import { RECORD_QUERY } from './record.query';
import { z } from 'zod';
import { extractName, isShortTrack, parseVenue } from 'src/utils';
import { Record } from './record.entity';
import {
  BirthdateSchema,
  DateSchema,
  MarkSchema,
  WindSchema,
} from 'src/athletes/athlete.zod';

export const CompetitionOrganiserInfoSchema = z.object({
  gender: z.enum(['women', 'men', 'mixed']),
  results: z.array(
    z.object({
      country: z.string(),
      discipline: z.string(),
      date: DateSchema,
      performance: MarkSchema,
      venue: z.string(),
      wind: WindSchema,
      pending: z.boolean(),
      mixed: z.boolean(),
      competitor: z.object({
        name: z.string(),
        country: z.string().nullable(),
        birthDate: BirthdateSchema,
        id: z.number().nullable(),
        teamMembers: z
          .array(
            z.object({
              name: z.string(),
              country: z.string(),
              birthDate: BirthdateSchema,
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

  async find(category: number): Promise<Record[]> | null {
    const records: Record[] = [];
    try {
      const data = await this.graphQLClient.request(RECORD_QUERY, {
        categoryId: category,
      });
      const response = z
        .object({
          getRecordsDetailByCategory: z
            .array(CompetitionOrganiserInfoSchema)
            .nullable(),
        })
        .parse(data);

      if (response.getRecordsDetailByCategory === null) {
        return null;
      }

      response.getRecordsDetailByCategory.forEach((record) => {
        record.results.forEach((result) => {
          if (result.pending) {
            return;
          }
          const athletes = result.competitor.teamMembers
            ? result.competitor.teamMembers
            : [result.competitor];
          const location = parseVenue(result.venue);
          records.push({
            gender: record.gender,
            discipline: result.discipline,
            date: new Date(result.date),
            shortTrack: isShortTrack(result.discipline),
            mark: result.performance,
            wind: result.wind,
            country: result.country,
            location,
            athletes: athletes.map((competitor) => ({
              ...extractName(competitor.name),
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
