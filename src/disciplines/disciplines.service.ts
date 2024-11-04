import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { z } from 'zod';
import { BaseDiscipline } from './discipline.dto';

import { GraphqlService } from 'src/graphql/graphql.service';
import { DISCIPLINES_QUERY } from 'src/disciplines/disciplines.query';
import { DisciplineSchema } from './disciplines.zod';

@Injectable()
export class DisciplinesService {
  private graphQLClient: GraphQLClient;
  constructor(private readonly graphqlService: GraphqlService) {
    this.graphQLClient = this.graphqlService.getClient();
  }

  async findAll(): Promise<BaseDiscipline[]> {
    const data = await this.graphQLClient.request(DISCIPLINES_QUERY);
    const reponse = z
      .object({
        getMetaData: z.object({
          disciplineCodes: z.array(DisciplineSchema),
        }),
      })
      .parse(data);
    const disciplines =  reponse.getMetaData.disciplineCodes.map((discipline) => {
      return {
        discipline: discipline.name,
        disciplineCode: discipline.code,
      };
    });
    return disciplines.filter((discipline) => {
      if(!discipline.disciplineCode.endsWith('sh')){
        return true;
      }
      const existsOther =  disciplines.some((d) => d.discipline === discipline.discipline && d.disciplineCode !== discipline.disciplineCode);
      if(existsOther){
        return false;
      }
      discipline.disciplineCode = discipline.disciplineCode.slice(0, -2);
      return true;
    });
  }
}
