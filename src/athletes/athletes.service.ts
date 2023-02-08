import { Injectable } from '@nestjs/common';
import { gql, GraphQLClient } from 'graphql-request';
import { z } from 'zod';
import * as Sentry from '@sentry/node';
import { AthleteDto } from './athlete.dto';

const ATHLETE_QUERY = gql`
  query Query($id: Int) {
    getSingleCompetitor(id: $id) {
      basicData {
        familyName
        givenName
        birthDate
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
      worldRankings {
        current {
          male
          eventGroup
          place
        }
      }
    }
  }
`;

export const BasicData = z.object({
  givenName: z.string(),
  familyName: z.string().transform((val) =>
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
  countryCode: z.string(),
  sexNameUrlSlug: z.nullable(z.enum(['women', 'men'])),
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

const CurrentWorldRanking = z.object({
  male: z.boolean(),
  eventGroup: z.string(),
  place: z.number(),
});

const Athlete = z.object({
  basicData: BasicData,
  seasonsBests: z.object({
    results: z.array(Performance),
  }),
  personalBests: z.object({
    results: z.array(Performance),
  }),
  worldRankings: z.object({
    current: z.array(CurrentWorldRanking),
  }),
});

@Injectable()
export class AthletesService {
  private graphQLClient: GraphQLClient;
  constructor() {
    this.graphQLClient = new GraphQLClient(process.env.STELLATE_ENDPOINT);
  }

  async getAthlete(id: number): Promise<AthleteDto | null> {
    try {
      const data = await this.graphQLClient.request(ATHLETE_QUERY, {
        id: String(id),
      });
      const reponse = z
        .object({
          getSingleCompetitor: Athlete,
        })
        .parse(data);
      const lastname = reponse.getSingleCompetitor.basicData.familyName
        .toLowerCase()
        .split(' ')
        .map((s) => s[0].toUpperCase() + s.substr(1, s.length))
        .join(' ');

      const worldRankingsSex =
        reponse.getSingleCompetitor.worldRankings.current.length > 0
          ? reponse.getSingleCompetitor.worldRankings.current[0].male
            ? 'MALE'
            : 'FEMALE'
          : null;

      return {
        id,
        firstname: reponse.getSingleCompetitor.basicData.givenName,
        lastname,
        birthdate: reponse.getSingleCompetitor.basicData.birthDate,
        country: reponse.getSingleCompetitor.basicData.countryCode,
        sex: reponse.getSingleCompetitor.basicData.sexNameUrlSlug
          ? reponse.getSingleCompetitor.basicData.sexNameUrlSlug === 'women'
            ? 'FEMALE'
            : 'MALE'
          : worldRankingsSex,
        currentWorldRankings:
          reponse.getSingleCompetitor.worldRankings.current.map((ranking) => {
            return {
              eventGroup: ranking.eventGroup,
              place: ranking.place,
            };
          }),
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
