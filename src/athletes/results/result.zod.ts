import {
  CompetitionNameSchema,
  DateSchema,
  MarkSchema,
  PlaceSchema,
  StringNumberSchema,
} from 'src/zod.schema';
import { z } from 'zod';

export const ResultsByEvent = z.object({
  resultsByEvent: z.array(
    z.object({
      discipline: z.string(),
      results: z.array(
        z.object({
          mark: MarkSchema,
          competition: CompetitionNameSchema,
          date: DateSchema,
          country: z.string(),
          notLegal: z.boolean(),
          venue: z.string(),
          wind: StringNumberSchema,
          resultScore: z.number(),
          race: z.string(),
          place: PlaceSchema,
          category: z.string().nullable().default('F'),
          competitionId: StringNumberSchema,
          eventId: StringNumberSchema,
        }),
      ),
    }),
  ),
});
