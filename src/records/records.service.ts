import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { GraphqlService } from 'src/graphql/graphql.service';
import { RECORD_CATEGORIES_QUERY, RECORD_QUERY } from './record.query';
import { z } from 'zod';
import { Record, RecordCategory } from './record.dto';
import { toPerformanceFields } from 'src/performance-conversion';
import { RecordSchema } from './record.zod';

@Injectable()
export class RecordsService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly graphqlService: GraphqlService,
  ) {}

  async find(categoryId: number): Promise<Record[] | null> {
    const cacheKey = `records:category:${categoryId}`;
    const cached = await this.cacheManager.get<Record[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const records: Record[] = [];
    const data = await this.graphqlService.getClient().request(RECORD_QUERY, {
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
        records.push({
          ...toPerformanceFields({
            discipline: result.discipline,
            mark: result.performance,
          }),
          place: 1,
          sex: record.gender,
          date: result.date,
          wind: result.wind,
          country: result.country,
          location: result.venue,
          athletes: athletes
            .filter(
              (competitor): competitor is typeof competitor & { id: number } =>
                competitor.id !== null,
            )
            .map((competitor) => {
              return {
                sex: null,
                ...competitor.name,
                country: competitor.country ?? result.country,
                birthdate: competitor.birthDate
                  ? competitor.birthDate.date
                  : null,
                birthdateOnlyYear: competitor.birthDate
                  ? competitor.birthDate.birthdateOnlyYear
                  : false,
                id: competitor.id,
              };
            }),
        });
      });
    });

    await this.cacheManager.set(cacheKey, records, 24 * 60 * 60 * 1000); // Cache for 24 hours
    return records;
  }

  async findCategories(): Promise<RecordCategory[]> {
    const cacheKey = 'records:categories';
    const cached = await this.cacheManager.get<RecordCategory[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await this.graphqlService
      .getClient()
      .request(RECORD_CATEGORIES_QUERY);
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

    const categories = response.getRecordsCategories
      .flatMap((category): RecordCategory[] => {
        if (!category.items || category.items.length === 0) {
          if (category.id === null) {
            return [];
          }
          return [
            {
              id: category.id,
              name: category.name,
            },
          ];
        }
        return category.items.map((item) => ({
          id: item.id,
          name: `${category.name} - ${item.name}`,
        }));
      })
      .sort((a, b) => a.id - b.id);

    await this.cacheManager.set(cacheKey, categories, 24 * 60 * 60 * 1000); // Cache for 24 hours
    return categories;
  }
}
