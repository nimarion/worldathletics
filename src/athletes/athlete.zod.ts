import { CompetitionNameSchema, DateSchema, LastnameSchema, MarkSchema, PlaceSchema, StringNumberSchema } from 'src/zod.schema';
import { z } from 'zod';

export const BasicData = z.object({
  givenName: z.string(),
  familyName: LastnameSchema,
  birthDate: DateSchema,
  countryCode: z.string(),
  sexNameUrlSlug: z.nullable(z.enum(['women', 'men'])),
});

const Performance = z.object({
  date: DateSchema,
  discipline: z.string(),
  mark: MarkSchema,
  venue: z.string(),
  notLegal: z.boolean(),
  resultScore: z.number(),
  wind: StringNumberSchema,
  records: z.array(z.string()),
  eventId: StringNumberSchema,
  competitionId: StringNumberSchema,
});

const WorldRanking = z.object({
  eventGroup: z.string(),
  place: PlaceSchema,
});

const Result = z.object({
  date: DateSchema,
  discipline: z.string(),
  mark: MarkSchema,
  venue: z.string(),
  competition: CompetitionNameSchema,
  place: PlaceSchema,
  competitionId: StringNumberSchema,
  eventId: StringNumberSchema,
});

export const Athlete = z.object({
  basicData: BasicData,
  seasonsBests: z.object({
    activeSeasons: z.array(
      z.preprocess((val) => {
        return Number(val);
      }, z.number()),
    ),
    results: z.array(Performance),
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
  athleteRepresentative: z.nullable(z.object({ _id: z.number() })).transform(
    (val) => {
      return val?._id ?? null;
    },
  ),
});

export const AthleteSearchSchema = z.object({
  aaAthleteId: StringNumberSchema,
  familyName: LastnameSchema,
  givenName: z.string(),
  birthDate: DateSchema,
  gender: z.string().transform((val) => {
    return val === 'Men'
    ? 'MALE'
    : val === 'Women'
      ? 'FEMALE'
      : null
  }),
  country: z.string(),
});
