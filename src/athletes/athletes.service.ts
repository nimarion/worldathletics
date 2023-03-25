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
          eventGroup
          place
        }
        best {
          place
          eventGroup
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
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date;
  }),
  countryCode: z.string(),
  sexNameUrlSlug: z.nullable(z.enum(['women', 'men'])),
});

const Performance = z.object({
  date: z.string().transform((val) => {
    const date = new Date(val);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date;
  }),
  discipline: z.string(),
  disciplineCode: z.string(),
  mark: z.string(),
  venue: z.string(),
  indoor: z.boolean(),
  notLegal: z.boolean(),
});

const WorldRanking = z.object({
  eventGroup: z.string(),
  place: z.preprocess((val) => {
    return Number(val);
  }, z.number()),
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
    best: z.array(WorldRanking),
    current: z.array(WorldRanking),
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
      const response = z
        .object({
          getSingleCompetitor: Athlete.nullable(),
        })
        .parse(data);
      if (!response.getSingleCompetitor) {
        return null;
      }
      const lastname = response.getSingleCompetitor.basicData.familyName
        .toLowerCase()
        .split(' ')
        .map((s) => s[0].toUpperCase() + s.slice(1))
        .join(' ');

      const worldRankingSex =
        response.getSingleCompetitor.worldRankings.best.length > 0
          ? response.getSingleCompetitor.worldRankings.best[0].eventGroup
              .toLowerCase()
              .includes('women')
            ? 'FEMALE'
            : 'MALE'
          : null;

      return {
        id,
        firstname: response.getSingleCompetitor.basicData.givenName,
        lastname,
        birthdate: response.getSingleCompetitor.basicData.birthDate,
        country: response.getSingleCompetitor.basicData.countryCode,
        sex: response.getSingleCompetitor.basicData.sexNameUrlSlug
          ? response.getSingleCompetitor.basicData.sexNameUrlSlug === 'women'
            ? 'FEMALE'
            : 'MALE'
          : worldRankingSex,
        currentWorldRankings:
          response.getSingleCompetitor.worldRankings.current.map((ranking) => {
            return {
              eventGroup: ranking.eventGroup,
              place: ranking.place,
            };
          }),
        seasonsbests: response.getSingleCompetitor.seasonsBests.results
          .filter((result) => {
            const diff = new Date().getTime() - result.date.getTime();
            const diffInMonths = diff / (1000 * 3600 * 24 * 30);
            return diffInMonths < 12;
          })
          .map((result) => {
            return {
              date: result.date,
              discipline: result.discipline,
              disciplineCode: result.disciplineCode,
              mark: result.mark.replace(/[^0-9:.]/g, ''),
              venue: result.venue,
              indoor: result.indoor,
              notLegal: result.notLegal,
            };
          }),
        personalbests: response.getSingleCompetitor.personalBests.results.map(
          (result) => {
            return {
              date: result.date,
              discipline: result.discipline,
              disciplineCode: result.disciplineCode,
              mark: result.mark.replace(/[^0-9:.]/g, ''),
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
