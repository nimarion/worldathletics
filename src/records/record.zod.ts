import { CountryCodeSchema, DateSchema, DisciplineNameSchema, FullnameSchema, GenderSchema, MarkSchema, VenueSchema } from 'src/zod.schema';
import { z } from 'zod';

export const RecordSchema = z.object({
  gender: GenderSchema,
  results: z.array(
    z.object({
      country: CountryCodeSchema,
      discipline: DisciplineNameSchema,
      date: DateSchema,
      performance: MarkSchema,
      venue: VenueSchema,
      wind: z.coerce.number(),
      pending: z.boolean(),
      mixed: z.boolean(),
      competitor: z.object({
        name: FullnameSchema,
        country: z.nullable(CountryCodeSchema),
        birthDate: z.nullable(DateSchema),
        id: z.number().nullable(),
        teamMembers: z
          .array(
            z.object({
              name: FullnameSchema,
              country: CountryCodeSchema,
              birthDate: z.nullable(DateSchema),
              id: z.number(),
            }),
          )
          .nullable(),
      }),
    }),
  ),
});
