import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { z } from 'zod';
import { Discipline } from './discipline.dto';

import { GraphqlService } from 'src/graphql/graphql.service';
import { isShortTrack } from 'src/utils';
import { DISCIPLINES_QUERY } from 'src/disciplines/disciplines.query';
import { DisciplineSchema } from './disciplines.zod';

@Injectable()
export class DisciplinesService {
  private graphQLClient: GraphQLClient;
  constructor(private readonly graphqlService: GraphqlService) {
    this.graphQLClient = this.graphqlService.getClient();
  }

  async findAll(): Promise<Discipline[]> {
    const data = await this.graphQLClient.request(DISCIPLINES_QUERY);
    const reponse = z
      .object({
        getMetaData: z.object({
          disciplineCodes: z.array(DisciplineSchema),
        }),
      })
      .parse(data);
    return reponse.getMetaData.disciplineCodes.map((discipline) => {
      return {
        discipline: discipline.name,
        disciplineCode: discipline.code,
        shortTrack: isShortTrack(discipline.name),
      };
    });
  }
}
