import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';

import { GraphqlService } from 'src/graphql/graphql.service';
import { RECORD_CATEGORIES_QUERY, RECORD_QUERY } from './record.query';
import { z } from 'zod';
import { isShortTrack, parseVenue } from 'src/utils';
import { Record, RecordCategory } from './record.dto';
import mapDisciplineToCode, { isTechnical } from 'src/discipline.utils';
import { performanceToFloat } from 'src/performance-conversion';
import { RecordSchema } from './record.zod';

@Injectable()
export class RecordsService {
  private graphQLClient: GraphQLClient;
  constructor(private readonly graphqlService: GraphqlService) {
    this.graphQLClient = this.graphqlService.getClient();
  }

  async find(categoryId: number): Promise<Record[] | null> {
    const records: Record[] = [];
    const data = await this.graphQLClient.request(RECORD_QUERY, {
      categoryId,
    });
    const response = z
      .object({
        getRecordsDetailByCategory: z.array(RecordSchema).nullable(),
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
          sex: record.gender,
          discipline: result.discipline,
          disciplineCode,
          date: result.date,
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
          athletes: athletes.map((competitor) => {
            return {
              sex: null,
              ...competitor.name!!,
              country: competitor.country!!,
              birthdate: competitor.birthDate,
              id: competitor.id!!,
            };
          }),
        });
      });
    });
    return records;
  }

  async findCategories(): Promise<RecordCategory[]> {
    const data = await this.graphQLClient.request(RECORD_CATEGORIES_QUERY);
    const response = z
      .object({
        getRecordsCategories: z.array(
          z.object({
            id: z.number().nullable(),
            name: z.string(),
            items: z
              .array(z.object({ id: z.number(), name: z.string() }))
              .nullable(),
          }),
        ),
      })
      .parse(data);

    return response.getRecordsCategories
      .map((category) => {
        if (!category.items || category.items.length == 0) {
          return [
            {
              id: category.id,
              name: category.name,
            } as RecordCategory,
          ];
        } else {
          return category.items.map((item) => {
            return {
              id: item.id,
              name: `${category.name} - ${item.name}`,
            } as RecordCategory;
          });
        }
      })
      .flat()
      .sort((a, b) => a.id - b.id);
  }
}
