import { z } from 'zod';

export const BasicData = z.object({
  givenName: z.string(),
  familyName: z.string().transform((val) =>
    val
      .toLowerCase()
      .split(' ')
      .map((s) => s[0].toUpperCase() + s.substr(1, s.length))
      .join(' '),
  ),
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

const Result = z.object({
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
  competition: z.string(),
  place: z.preprocess((val) => {
    return Number(val);
  }, z.number()),
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
