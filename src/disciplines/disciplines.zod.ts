import { z } from 'zod';

export const DisciplineSchema = z.object({
  name: z.string(),
  code: z.string(),
});
