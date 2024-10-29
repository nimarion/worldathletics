import { DateSchema } from 'src/zod.schema';
import { z } from 'zod';

export const CompetitionOrganiserInfoSchema = z.object({
  liveStreamingUrl: z.string().transform((val) => {
    return val === '' ? null : val;
  }),
  resultsPageUrl: z.string().transform((val) => {
    return val === '' ? null : val;
  }),
  websiteUrl: z.string().transform((val) => {
    return val === '' ? null : val;
  }),
  units: z.array(
    z.object({
      events: z.array(z.string()),
      gender: z.string(),
    }),
  ),
  contactPersons: z.array(
    z.object({
      email: z.string(),
      phoneNumber: z.string(),
      title: z.string(),
      name: z.string(),
    }),
  ),
});

export const CompetitionSchema = z.object({
  id: z.number(),
  hasResults: z.boolean(),
  name: z.string(),
  venue: z.string(),
  area: z.string(),
  rankingCategory: z.string(),
  disciplines: z
    .string()
    .nullable()
    .transform((val) => {
      return val ? val.split(',').map((discipline) => discipline.trim()) : [];
    }),
  startDate: DateSchema,
  endDate: DateSchema,
  hasCompetitionInformation: z.boolean(),
  hasStartlist: z.boolean(),
  competitionGroup: z.string().nullable(),
  competitionSubgroup: z.string().nullable(),
});
