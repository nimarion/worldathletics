import { formatLastname } from 'src/name.utils';
import { z } from 'zod';

export const BasicData = z.object({
  givenName: z.string(),
  familyName: z.string().transform((val) => formatLastname(val)),
  birthDate: z
    .string()
    .nullable()
    .transform((val) => {
      if (!val) return null;
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
  mark: z.string(),
  venue: z.string(),
  notLegal: z.boolean(),
  resultScore: z.number(),
  wind: z
    .preprocess((val) => {
      if (!val) return null;
      if (isNaN(Number(val))) return null;
      return Number(val);
    }, z.number().nullable())
    .nullable(),
  records: z.array(z.string()),
  eventId: z.preprocess((val) => {
    if (val === null) {
      return null;
    }
    try {
      return Number(val);
    } catch (error) {
      console.log(val, error);
      return null;
    }
  }, z.number().nullable()),
  competitionId: z.preprocess((val) => {
    if (val === null) {
      return null;
    }
    try {
      return Number(val);
    } catch (error) {
      console.log(val, error);
      return null;
    }
  }, z.number().nullable()),
});

const WorldRanking = z.object({
  eventGroup: z.string(),
  place: z.preprocess((val) => {
    return Number(val);
  }, z.number()),
});

const Result = z.object({
  date: z.string().transform((val) => {
    const date = new Date(val);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date;
  }),
  discipline: z.string(),
  mark: z.string(),
  venue: z.string(),
  competition: z.string(),
  place: z.preprocess((val) => {
    return Number(val);
  }, z.number()),
  competitionId: z.preprocess((val) => {
    if (val == null) {
      return null;
    }
    try {
      return Number(val);
    } catch (error) {
      console.log(val, error);
      return null;
    }
  }, z.number().nullable()),
  eventId: z.preprocess((val) => {
    if (val == null) {
      return null;
    }
    try {
      return Number(val);
    } catch (error) {
      console.log(val, error);
      return null;
    }
  }, z.number().nullable()),
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
});
