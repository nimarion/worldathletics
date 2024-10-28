import { cleanupCompetitionName, cleanupMark, extractName, formatLastname } from 'src/utils';
import { z } from 'zod';

export const BirthdateSchema = z
  .string()
  .nullable()
  .transform((val) => {
    if (!val) return null;
    const date = new Date(val);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date;
  });

export const LastnameSchema = z
  .string()
  .transform((val) => formatLastname(val));

export const FullnameSchema = z.string().transform(extractName);

export const UrlSlugIdSchema = z.string().nullable().transform((val) => {
  if (!val) return null;
  const idMatch = val.match(/-(\d+)$/);
  const id = idMatch ? idMatch[1] : null;
  return Number(id);
});

export const BasicData = z.object({
  givenName: z.string(),
  familyName: LastnameSchema,
  birthDate: BirthdateSchema,
  countryCode: z.string(),
  sexNameUrlSlug: z.nullable(z.enum(['women', 'men'])),
});

export const MarkSchema = z.string().transform((val) => cleanupMark(val));
export const PlaceSchema = z.preprocess((val) => {
  // Out of competition results are marked as OC
  if (val === 'OC') {
    return -1;
  }
  try {
    const number = Number(val);
    if (isNaN(number)) {
      return -1;
    }
    return number;
  } catch (error) {
    console.log(val, error);
    return -1;
  }
}, z.number());

export const WindSchema = z
  .preprocess((val) => {
    if (!val) return null;
    if (isNaN(Number(val))) return null;
    return Number(val);
  }, z.number().nullable())
  .nullable();

export const CompetitionSchema = z
  .string()
  .transform((val) => cleanupCompetitionName(val));

export const DateSchema = z.string().transform((val) => {
  const date = new Date(val);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date;
});

export const CompetitionIdSchema = z.preprocess((val) => {
  if (val == null) {
    return null;
  }
  try {
    return Number(val);
  } catch (error) {
    console.log(val, error);
    return null;
  }
}, z.number().nullable());

export const EventIdSchema = z.preprocess((val) => {
  if (val == null) {
    return null;
  }
  try {
    return Number(val);
  } catch (error) {
    console.log(val, error);
    return null;
  }
}, z.number().nullable());

const Performance = z.object({
  date: DateSchema,
  discipline: z.string(),
  mark: MarkSchema,
  venue: z.string(),
  notLegal: z.boolean(),
  resultScore: z.number(),
  wind: WindSchema,
  records: z.array(z.string()),
  eventId: EventIdSchema,
  competitionId: CompetitionIdSchema,
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
  competition: CompetitionSchema,
  place: PlaceSchema,
  competitionId: CompetitionIdSchema,
  eventId: EventIdSchema,
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
  aaAthleteId: z.preprocess((val) => {
    if (!val) return null;
    if (isNaN(Number(val))) return null;
    return Number(val);
  }, z.number()),
  familyName: LastnameSchema,
  givenName: z.string(),
  birthDate: BirthdateSchema,
  gender: z.string().transform((val) => {
    return val === 'Men'
    ? 'MALE'
    : val === 'Women'
      ? 'FEMALE'
      : null
  }),
  country: z.string(),
});
