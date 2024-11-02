import { formatSex } from 'src/utils';
import {
  CompetitionNameSchema,
  DateSchema,
  LastnameSchema,
  MarkSchema,
  PlaceSchema,
} from 'src/zod.schema';
import { z } from 'zod';

export const BasicData = z.object({
  givenName: z.string(),
  familyName: LastnameSchema,
  birthDate: z.nullable(DateSchema),
  countryCode: z.string(),
  sexNameUrlSlug: z.nullable(z.enum(['women', 'men'])),
});

const Performance = z.object({
  date: z.nullable(DateSchema),
  discipline: z.string(),
  mark: MarkSchema,
  venue: z.string(),
  notLegal: z.boolean(),
  resultScore: z.number(),
  wind: z.coerce
    .number()
    .nullable()
    .catch(() => null),
  records: z.array(z.string()),
  eventId: z.coerce.number(),
  competitionId: z.coerce.number(),
});

const WorldRanking = z.object({
  eventGroup: z.string(),
  place: PlaceSchema,
});

const Result = z.object({
  date: z.nullable(DateSchema),
  discipline: z.string(),
  mark: MarkSchema,
  venue: z.string(),
  competition: CompetitionNameSchema,
  place: PlaceSchema,
  competitionId: z.coerce.number(),
  eventId: z.coerce.number(),
});

export const Athlete = z.object({
  basicData: BasicData,
  seasonsBests: z.object({
    activeSeasons: z.array(
      z.preprocess((val) => {
        return Number(val);
      }, z.number()),
    ),
    results: z.array(Performance).transform((val) => {
      return val.filter((result) => {
        if (!result.date) {
          return false;
        }
        const diff = new Date().getTime() - result.date.getTime();
        const diffInMonths = diff / (1000 * 3600 * 24 * 30);
        return diffInMonths < 12;
      });
    }),
  }),
  personalBests: z.object({
    results: z.array(Performance),
  }),
  worldRankings: z.object({
    best: z.array(WorldRanking),
    current: z.array(WorldRanking),
  }),
  honours: z.array(
    z.object({
      results: z.array(Result),
      categoryName: z.string(),
    }),
  ),
  athleteRepresentative: z
    .nullable(z.object({ _id: z.number() }))
    .transform((val) => {
      return val?._id ?? null;
    }),
});

export const AthleteSearchSchema = z.object({
  aaAthleteId: z.coerce.number(),
  familyName: LastnameSchema,
  givenName: z.string(),
  birthDate: z.nullable(DateSchema),
  gender: z.string().transform(formatSex),
  country: z.string(),
});
