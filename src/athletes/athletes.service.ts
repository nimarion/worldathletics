import { Injectable } from '@nestjs/common';
import { gql, GraphQLClient } from 'graphql-request';
import { z } from 'zod';
import * as Sentry from '@sentry/node';

const ATHLETE_QUERY = gql`
  query Query($id: Int) {
    getSingleCompetitor(id: $id) {
      basicData {
        lastName
        firstName
        birthDate
        countryName
        countryCode
      }
      seasonsBests {
        results {
          discipline
          disciplineCode
          date
          mark
          venue
          indoor
          notLegal
        }
      }
      personalBests {
        results {
          discipline
          disciplineCode
          date
          mark
          venue
          indoor
          notLegal
        }
      }
    }
  }
`;

export const BasicData = z.object({
  firstName: z.string(),
  lastName: z.string().transform((val) =>
    val
      .toLowerCase()
      .split(' ')
      .map((s) => s[0].toUpperCase() + s.substr(1, s.length))
      .join(' '),
  ),
  birthDate: z.string().transform((val) => {
    const date = new Date(val);
    const birthday = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1,
      0,
      0,
      0,
      0,
    );
    return birthday;
  }),
  countryName: z.string(),
  countryCode: z.string(),
});

const Performance = z.object({
  date: z.string().transform((val) => {
    const date = new Date(val);
    const d = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1,
      0,
      0,
      0,
      0,
    );
    return d;
  }),
  discipline: z.string(),
  disciplineCode: z.string(),
  mark: z.string(),
  venue: z.string(),
  indoor: z.boolean(),
  notLegal: z.boolean(),
});

const Athlete = z.object({
  basicData: BasicData,
  seasonsBests: z.object({
    results: z.array(Performance),
  }),
  personalBests: z.object({
    results: z.array(Performance),
  }),
});

export type PerfomanceType = z.infer<typeof Performance>;
export type BasicDataType = z.infer<typeof BasicData>;
export type AthleteType = z.infer<typeof Athlete>;

@Injectable()
export class AthletesService {
  private graphQLClient: GraphQLClient;
  constructor() {
    this.graphQLClient = new GraphQLClient(process.env.STELLATE_ENDPOINT);
  }

  async getAthlete(id: number) {
    try {
      const data = await this.graphQLClient.request(ATHLETE_QUERY, {
        id: String(id),
      });
      const reponse = z
        .object({
          getSingleCompetitor: Athlete,
        })
        .parse(data);
      return reponse.getSingleCompetitor;
    } catch (error) {
      console.error(error);
      Sentry.withScope((scope) => {
        scope.setExtra('id', id);
        Sentry.captureException(error);
      });
    }
    return null;
  }
}
