import { z } from 'zod';
import {
  cleanupCompetitionName,
  cleanupMark,
  extractName,
  formatLastname,
} from './utils';

export const LastnameSchema = z.string().transform(formatLastname);
export const FullnameSchema = z.string().transform(extractName);
export const CompetitionNameSchema = z
  .string()
  .transform(cleanupCompetitionName);
export const MarkSchema = z.string().transform(cleanupMark);

// spain/alvaro-martin-14410246
export const UrlSlugIdSchema = z
  .string()
  .nullable()
  .transform((val) => {
    if (!val) return null;
    const idMatch = val.match(/-(\d+)$/);
    const id = idMatch ? idMatch[1] : null;
    if (!id) return null;
    return Number(id);
  });

// Converts string to date and removes timezone offset
export const DateSchema = z
  .string()
  .pipe(z.coerce.date())
  .transform((val) => {
    val.setMinutes(val.getMinutes() - val.getTimezoneOffset());
    return val;
  });

export const PlaceSchema = z.preprocess((val) => {
  // Out of competition results are marked as OC
  if (val === 'OC') {
    return -1;
  }
  try {
    const number = Number(val);
    if (isNaN(number)) {
      return -1;
    }
    return number;
  } catch (error) {
    console.log(val, error);
    return -1;
  }
}, z.number());
