import { z } from 'zod';

export const CountrySchema = z.object({
  areaCode: z.string(),
  areaName: z.string(),
  id: z.string(),
  isValid: z.boolean(),
  countryName: z.string(),
});
