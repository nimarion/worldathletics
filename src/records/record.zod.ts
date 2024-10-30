import { formatSex } from 'src/utils';
import { DateSchema, FullnameSchema, MarkSchema } from 'src/zod.schema';
import { z } from 'zod';

export const RecordSchema = z.object({
  gender: z.string().transform(formatSex),
  results: z.array(
    z.object({
      country: z.string(),
      discipline: z.string(),
      date: DateSchema,
      performance: MarkSchema,
      venue: z.string(),
      wind: z.coerce.number(),
      pending: z.boolean(),
      mixed: z.boolean(),
      competitor: z.object({
        name: FullnameSchema,
        country: z.string().nullable(),
        birthDate: z.nullable(DateSchema),
        id: z.number().nullable(),
        teamMembers: z
          .array(
            z.object({
              name: FullnameSchema,
              country: z.string(),
              birthDate: z.nullable(DateSchema),
              id: z.number(),
            }),
          )
          .nullable(),
      }),
    }),
  ),
});
