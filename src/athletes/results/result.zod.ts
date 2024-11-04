import {
  CompetitionNameSchema,
  CountryCodeSchema,
  DateSchema,
  DisciplineNameSchema,
  MarkSchema,
  PlaceSchema,
  VenueSchema,
} from 'src/zod.schema';
import { z } from 'zod';

export const ResultsByEvent = z.object({
  resultsByEvent: z.array(
    z.object({
      discipline: DisciplineNameSchema,
      results: z.array(
        z.object({
          mark: MarkSchema,
          competition: CompetitionNameSchema,
          date: z.nullable(DateSchema),
          country: CountryCodeSchema,
          notLegal: z.boolean(),
          venue: VenueSchema,
          wind: z.coerce
            .number()
            .nullable()
            .catch(() => null),
          resultScore: z.number(),
          race: z.string(),
          place: PlaceSchema,
          category: z.string().nullable().default('F'),
          competitionId: z.coerce.number(),
          eventId: z.coerce.number(),
        }),
      ),
    }),
  ),
});
