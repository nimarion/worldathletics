import { z } from 'zod';

export const AthleteRepresentative = z.object({
  athleteRepresentativeId: z.number(),
  countryCode: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.array(z.string().nullable()).optional().default([]),
  mobile: z.array(z.string().nullable()).optional().default([]),
});
