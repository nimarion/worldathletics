import { z } from 'zod';
import {
  cleanupCompetitionName,
  cleanupMark,
  extractName,
  formatLastname,
  formatSex,
  parsePhoneNumber,
  parseVenue,
} from './utils';
import { findCountryByCode, mapCountryToCode } from './country.utils';
import { cleanupDiscipline } from './discipline.utils';

export const FirstnameSchema = z.string();
export const LastnameSchema = z.string().transform(formatLastname);
export const FullnameSchema = z.string().transform(extractName);
export const CompetitionNameSchema = z
  .string()
  .transform(cleanupCompetitionName);
export const MarkSchema = z.string().transform(cleanupMark);
export const GenderSchema = z.string().transform(formatSex);
export const DisciplineNameSchema = z.string().transform(cleanupDiscipline);
export const CountryCodeSchema = z.string().transform((val) => {
  const country= findCountryByCode(val);
  if(country){
    return country.id;
  }
  console.error(`Country ${val} not found`);
  return val;
})
export const VenueSchema = z.string().transform(parseVenue);
export const PhoneSchema = z.string().transform(parsePhoneNumber);

// spain/alvaro-martin-14410246
export const UrlSlugIdSchema = z.string().transform((val) => {
  const idMatch = val.match(/^([a-z-]+)\/[a-z-]+-(\d+)$/);
  if(!idMatch) {
    throw new Error(`Invalid URL slug: ${val}`);
  }
  return {
    id: Number(idMatch[2]),
    country: mapCountryToCode(idMatch[1]),
  };
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
