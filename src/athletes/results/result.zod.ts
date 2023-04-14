import { z } from 'zod';

export const ResultsByEvent = z.object({
  resultsByEvent: z.array(
    z.object({
      disciplineCode: z.string(),
      discipline: z.string(),
      indoor: z.boolean(),
      results: z.array(
        z.object({
          mark: z.string(),
          competition: z.string(),
          date: z.string().transform((val) => {
            const date = new Date(val);
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
            return date;
          }),
          country: z.string(),
          notLegal: z.boolean(),
          venue: z.string(),
          wind: z
            .preprocess((val) => {
              return Number(val);
            }, z.number())
            .nullable(),
          resultScore: z.number(),
          race: z.string(),
          place: z.preprocess((val) => {
            return Number(val);
          }, z.number()),
          category: z.string(),
        }),
      ),
    }),
  ),
});
