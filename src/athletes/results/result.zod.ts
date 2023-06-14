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
              if (val === 'NWI') {
                return null;
              }
              try {
                return Number(val);
              } catch (error) {
                console.log(val, error);
                return null;
              }
            }, z.number().nullable())
            .nullable(),
          resultScore: z.number(),
          race: z.string(),
          place: z.preprocess((val) => {
            // Out of competition results are marked as OC
            if (val === 'OC') {
              return 0;
            }
            try {
              return Number(val);
            } catch (error) {
              console.log(val, error);
              return -1;
            }
          }, z.number()),
          category: z.string(),
        }),
      ),
    }),
  ),
});
