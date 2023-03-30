import { Injectable } from '@nestjs/common';
import { gql, GraphQLClient } from 'graphql-request';
import { z } from 'zod';
import { Discipline } from './discipline.entity';
import * as Sentry from '@sentry/node';

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
  constructor() {
    this.graphQLClient = new GraphQLClient(process.env.STELLATE_ENDPOINT);
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
        };
      });
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
    }
    return null;
  }
}
