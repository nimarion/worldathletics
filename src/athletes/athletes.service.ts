import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { z } from 'zod';
import * as Sentry from '@sentry/node';
import { Athlete } from './athlete.dto';
import ATHLETE_QUERY from './athlete.query';
import { Athlete as AthleteSchema } from './athlete.zod';
import parseVenue from './venue.utils';
import mapDisciplineToCode from 'src/discipline.utils';

@Injectable()
export class AthletesService {
  private graphQLClient: GraphQLClient;
  constructor() {
    this.graphQLClient = new GraphQLClient(process.env.STELLATE_ENDPOINT);
  }

  async getAthlete(id: number): Promise<Athlete | null> {
    try {
      const data = await this.graphQLClient.request(
        ATHLETE_QUERY,
        {
          id: String(id),
        },
        {
          'x-athlete-id': String(id),
        },
      );
      const response = z
        .object({
          getSingleCompetitor: AthleteSchema.nullable(),
        })
        .parse(data);
      if (!response.getSingleCompetitor) {
        return null;
      }
      const lastname = response.getSingleCompetitor.basicData.familyName
        .toLowerCase()
        .split(' ')
        .map((s) => s[0].toUpperCase() + s.slice(1))
        .join(' ')
        // if lastname contains "-" like Skupin-alfa -> capitalize both parts
        .split('-')
        .map((s) => s[0].toUpperCase() + s.slice(1))
        .join('-');

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
        activeSeasons: response.getSingleCompetitor.seasonsBests.activeSeasons,
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
            const location = parseVenue(result.venue);
            const indoor = result.venue.endsWith('(i)');
            result.venue = result.venue.replace(' (i)', '');
            return {
              date: result.date,
              discipline: result.discipline,
              disciplineCode: mapDisciplineToCode(result.discipline),
              shortTrack: result.discipline.endsWith('Short Track'),
              mark: result.mark.replace(/[^0-9:.]/g, ''),
              venue: result.venue,
              location,
              indoor,
              legal: !result.notLegal,
              resultScore: result.resultScore,
              wind: result.wind,
              competition: null,
              category: null,
              race: null,
              place: null,
              records: result.records,
            };
          }),
        personalbests: response.getSingleCompetitor.personalBests.results.map(
          (result) => {
            const location = parseVenue(result.venue);
            const indoor = result.venue.endsWith('(i)');
            result.venue = result.venue.replace(' (i)', '');
            return {
              date: result.date,
              discipline: result.discipline,
              disciplineCode: mapDisciplineToCode(result.discipline),
              shortTrack: result.discipline.endsWith('Short Track'),
              mark: result.mark.replace(/[^0-9:.]/g, ''),
              venue: result.venue,
              location,
              indoor,
              legal: !result.notLegal,
              resultScore: result.resultScore,
              wind: result.wind,
              competition: null,
              category: null,
              race: null,
              place: null,
              records: result.records,
            };
          },
        ),
        honours: response.getSingleCompetitor.honours.map((honour) => {
          return {
            category: honour.categoryName,
            results: honour.results.map((result) => {
              const indoor = result.venue.endsWith('(i)');
              result.venue = result.venue.replace(' (i)', '');
              return {
                date: result.date,
                discipline: result.discipline,
                disciplineCode: mapDisciplineToCode(result.discipline),
                shortTrack: result.discipline.endsWith('Short Track'),
                mark: result.mark.replace(/[^0-9:.]/g, ''),
                venue: result.venue,
                location: parseVenue(result.venue),
                indoor,
                competition: result.competition,
                place: result.place,
                resultScore: 0,
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
