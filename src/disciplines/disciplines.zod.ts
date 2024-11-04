import { DisciplineNameSchema } from 'src/zod.schema';
import { z } from 'zod';

export const DisciplineSchema = z.object({
  name: DisciplineNameSchema,
  code: z.string(),
});
