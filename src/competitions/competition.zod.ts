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
