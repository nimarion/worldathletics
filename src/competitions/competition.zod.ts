import { z } from 'zod';

export const CompetitionOrganiserInfoSchema = z.object({
  liveStreamingUrl: z.string(),
  resultsPageUrl: z.string(),
  websiteUrl: z.string(),
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
  disciplines: z.string().nullable(),
  startDate: z.string().transform((val) => {
    if (!val) return null;
    const date = new Date(val);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date;
  }),
  endDate: z.string().transform((val) => {
    if (!val) return null;
    const date = new Date(val);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date;
  }),
  dateRange: z.string(),
  hasCompetitionInformation: z.boolean(),
  hasStartlist: z.boolean(),
  competitionGroup: z.string().nullable(),
  competitionSubgroup: z.string().nullable(),
});