import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { z } from 'zod';
import * as Sentry from '@sentry/node';
import { AthleteDto } from './athlete.dto';
import ATHLETE_QUERY from './athlete.query';
import { Athlete } from './athlete.zod';

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
          .filter((result) => !result.notLegal)
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
        personalbests: response.getSingleCompetitor.personalBests.results
          .filter((result) => !result.notLegal)
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
        honours: response.getSingleCompetitor.honours.map((honour) => {
          return {
            category: honour.categoryName,
            results: honour.results.map((result) => {
              return {
                date: result.date,
                discipline: result.discipline,
                disciplineCode: result.disciplineCode,
                mark: result.mark.replace(/[^0-9:.]/g, ''),
                venue: result.venue,
                indoor: result.indoor,
                competition: result.competition,
                place: result.place,
              };
            }),
          };
        }),
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
