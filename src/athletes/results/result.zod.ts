import { z } from 'zod';
import {
  CompetitionIdSchema,
  CompetitionSchema,
  DateSchema,
  EventIdSchema,
  MarkSchema,
  PlaceSchema,
  WindSchema,
} from '../athlete.zod';

export const ResultsByEvent = z.object({
  resultsByEvent: z.array(
    z.object({
      discipline: z.string(),
      results: z.array(
        z.object({
          mark: MarkSchema,
          competition: CompetitionSchema,
          date: DateSchema,
          country: z.string(),
          notLegal: z.boolean(),
          venue: z.string(),
          wind: WindSchema,
          resultScore: z.number(),
          race: z.string(),
          place: PlaceSchema,
          category: z.string().nullable().default('F'),
          competitionId: CompetitionIdSchema,
          eventId: EventIdSchema,
        }),
      ),
    }),
  ),
});
