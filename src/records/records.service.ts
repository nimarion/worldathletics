import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';

import { GraphqlService } from 'src/graphql/graphql.service';
import { RECORD_CATEGORIES_QUERY, RECORD_QUERY } from './record.query';
import { z } from 'zod';
import { extractName, isShortTrack, parseVenue } from 'src/utils';
import { Record, RecordCategory } from './record.entity';
import {
  BirthdateSchema,
  DateSchema,
  MarkSchema,
  WindSchema,
} from 'src/athletes/athlete.zod';
import mapDisciplineToCode, { isTechnical } from 'src/discipline.utils';
import { performanceToFloat } from 'src/performance-conversion';

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
          const disciplineCode = mapDisciplineToCode(result.discipline);
          records.push({
            gender: record.gender,
            discipline: result.discipline,
            disciplineCode,
            date: new Date(result.date),
            shortTrack: isShortTrack(result.discipline),
            mark: result.performance,
            performanceValue: performanceToFloat({
              performance: result.performance,
              technical: isTechnical({
                disciplineCode,
                performance: result.performance,
              }),
            }),
            wind: result.wind,
            country: result.country,
            location,
            athletes: athletes.map((competitor) => ({
              sex: null,
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
    }
    return records;
  }

  async findCategories(): Promise<RecordCategory[]> {
    const categories: RecordCategory[] = [];
    try {
      const data = await this.graphQLClient.request(RECORD_CATEGORIES_QUERY);
      const response = z
        .object({
          getRecordsCategories: z
            .array(
              z.object({
                id: z.number().nullable(),
                name: z.string(),
                items: z
                  .array(z.object({ id: z.number(), name: z.string() }))
                  .nullable(),
              }),
            )
            .nullable(),
        })
        .parse(data);

      if (response.getRecordsCategories === null) {
        return [];
      }
      response.getRecordsCategories.forEach((category) => {
        if (!category.items || category.items.length == 0) {
          categories.push({
            id: category.id,
            name: category.name,
          });
        } else {
          category.items.forEach((item) => {
            categories.push({
              id: item.id,
              name: `${category.name} - ${item.name}`,
            });
          });
        }
      });
    } catch (error) {
      console.error(error);
    }
    return categories.sort((a, b) => a.id - b.id);
  }
}
