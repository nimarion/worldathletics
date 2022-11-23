import { Injectable } from '@nestjs/common';
import { gql, GraphQLClient } from 'graphql-request';
import { z } from 'zod';
import * as Sentry from '@sentry/node';
import { AthleteDto } from './athlete.dto';

const ATHLETE_QUERY = gql`
  query Query($id: Int) {
    getSingleCompetitor(id: $id) {
      basicData {
        lastName
        firstName
        birthDate
        countryName
        countryCode
        sexNameUrlSlug
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
  sexNameUrlSlug: z.enum(['women', 'men']),
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

@Injectable()
export class AthletesService {
  private graphQLClient: GraphQLClient;
  constructor() {
    this.graphQLClient = new GraphQLClient(process.env.STELLATE_ENDPOINT);
  }

  async getAthlete(id: number): Promise<AthleteDto> {
    try {
      const data = await this.graphQLClient.request(ATHLETE_QUERY, {
        id: String(id),
      });
      const reponse = z
        .object({
          getSingleCompetitor: Athlete,
        })
        .parse(data);
      return {
        firstname: reponse.getSingleCompetitor.basicData.firstName,
        lastname: reponse.getSingleCompetitor.basicData.lastName,
        birthdate: reponse.getSingleCompetitor.basicData.birthDate,
        country: reponse.getSingleCompetitor.basicData.countryCode,
        sex:
          reponse.getSingleCompetitor.basicData.sexNameUrlSlug === 'women'
            ? 'FEMALE'
            : 'MALE',
        seasonsbests: reponse.getSingleCompetitor.seasonsBests.results.map(
          (result) => {
            return {
              date: result.date,
              discipline: result.discipline,
              disciplineCode: result.disciplineCode,
              mark: result.mark,
              venue: result.venue,
              indoor: result.indoor,
              notLegal: result.notLegal,
            };
          },
        ),
        personalbests: reponse.getSingleCompetitor.personalBests.results.map(
          (result) => {
            return {
              date: result.date,
              discipline: result.discipline,
              disciplineCode: result.disciplineCode,
              mark: result.mark,
              venue: result.venue,
              indoor: result.indoor,
              notLegal: result.notLegal,
            };
          },
        ),
      };
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
