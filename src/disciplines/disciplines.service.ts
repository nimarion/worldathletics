import { Injectable } from '@nestjs/common';
import { gql, GraphQLClient } from 'graphql-request';
import { z } from 'zod';
import { Discipline } from './discipline.entity';
import * as Sentry from '@sentry/node';
import { GraphqlService } from 'src/graphql/graphql.service';

const COUNTRIES_QUERY = gql`
  query MyQuery {
    getMetaData(types: disciplineCodes) {
      disciplineCodes {
        name
        code
      }
    }
  }
`;

const DisciplineSchema = z.object({
  name: z.string(),
  code: z.string(),
});

@Injectable()
export class DisciplinesService {
  private graphQLClient: GraphQLClient;
  constructor(private readonly graphqlService: GraphqlService) {
    this.graphQLClient = this.graphqlService.getClient();
  }

  async findAll(): Promise<Discipline[]> {
    try {
      const data = await this.graphQLClient.request(COUNTRIES_QUERY);
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
          shortTrack: discipline.name.endsWith('Short Track'),
        };
      });
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
    }
    return null;
  }
}
