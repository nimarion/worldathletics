import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GraphQLClient } from 'graphql-request';
import { z } from 'zod';
import { BaseDiscipline } from './discipline.dto';

import { GraphqlService } from 'src/graphql/graphql.service';
import { DISCIPLINES_QUERY } from 'src/disciplines/disciplines.query';
import { DisciplineSchema } from './disciplines.zod';

@Injectable()
export class DisciplinesService {
  private graphQLClient: GraphQLClient;
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly graphqlService: GraphqlService,
  ) {
    this.graphQLClient = this.graphqlService.getClient();
  }

  async findAll(): Promise<BaseDiscipline[]> {
    const cacheKey = 'disciplines:all';
    const cached = await this.cacheManager.get<BaseDiscipline[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await this.graphQLClient.request(DISCIPLINES_QUERY);
    const reponse = z
      .object({
        getMetaData: z.object({
          disciplineCodes: z.array(DisciplineSchema),
        }),
      })
      .parse(data);

    const disciplines = reponse.getMetaData.disciplineCodes.map(
      (discipline) => {
        return {
          discipline: discipline.name,
          disciplineCode: discipline.code,
        };
      },
    );

    const filteredDisciplines = disciplines.filter((discipline) => {
      if (!discipline.disciplineCode.endsWith('sh')) {
        return true;
      }
      const existsOther = disciplines.some(
        (d) =>
          d.discipline === discipline.discipline &&
          d.disciplineCode !== discipline.disciplineCode,
      );
      if (existsOther) {
        return false;
      }
      discipline.disciplineCode = discipline.disciplineCode.slice(0, -2);
      return true;
    });

    await this.cacheManager.set(
      cacheKey,
      filteredDisciplines,
      24 * 60 * 60 * 1000,
    ); // cache for 24 hours (86400000ms)
    return filteredDisciplines;
  }
}
