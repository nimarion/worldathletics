import {
  formatIncompletePhoneNumber,
  isValidPhoneNumber,
  parseIncompletePhoneNumber,
  parsePhoneNumberWithError,
} from 'libphonenumber-js/max';
import { Location } from './location.dto';
import { Sex } from './athletes/athlete.dto';

export function formatLastname(lastname: string): string {
  return (
    lastname
      .toLowerCase()
      .split(' ')
      .filter((s) => s.length > 0)
      .map((s) => s[0].toUpperCase() + s.slice(1))
      .join(' ')
      // if lastname contains "-" like Skupin-alfa -> capitalize both parts
      .split('-')
      .map((s) => s[0].toUpperCase() + s.slice(1))
      .join('-')
  );
}

export function extractName(name: string) {
  const regex = /^(.*)\s+([A-Z\s\W]+)$/;
  const match = name.match(regex);

  if (match) {
    return {
      firstname: match[1].trim(),
      lastname: formatLastname(match[2].trim()),
    };
  }
  return null;
}

export function cleanupMark(mark: string): string {
  return mark.replace(/[^0-9:.]/g, '');
}

export function cleanupCompetitionName(competitionName: string) {
  return competitionName.replace(' (i)', '').split(',')[0];
}

export function parseVenue(venue: string): Location {
  venue = venue.trim();
  const indoor = isIndoor(venue);
  if (indoor) {
    venue = venue.replace('(i)', '').trim();
  }
  const parts = venue.split(', ');
  if (parts.length === 1) {
    const [city, country] = parseCountryAndCity(parts[0]);
    return {
      country,
      city,
      indoor,
    };
  }
  const stadium = parts[0];
  const rest = parts.slice(1).join(', ');
  const [city, country] = parseCountryAndCity(rest);
  // Columbia, MO (USA) - US states...
  if (city === city.toUpperCase()) {
    return {
      city: stadium,
      country,
      indoor,
    };
  }
  return {
    stadium,
    city,
    country,
    indoor,
  };
}

function parseCountryAndCity(countryAndCity: string): [string, string] {
  const regex = /(.+?)\s*\((\w+(?:\s+\w+)*)\)/;
  const matchResult = countryAndCity.match(regex);
  if (!matchResult) {
    throw new Error(`Cannot parse country and city from ${countryAndCity}`);
  }
  const city = matchResult[1].replace(/, [A-Z]+$/, '');
  const country = matchResult[2];
  return [city, country];
}

export function isIndoor(venue: string): boolean {
  return venue.endsWith('(i)');
}

export function parsePhoneNumber(number: string): string | null {
  if (!isValidPhoneNumber(number, 'US')) {
    if (isValidPhoneNumber(parseIncompletePhoneNumber(number), 'US')) {
      number = formatIncompletePhoneNumber(number);
    } else {
      console.error('invalid phone number', number);
      return null;
    }
  }
  try {
    const phoneNumber = parsePhoneNumberWithError(number, 'US');
    if (!phoneNumber) return null;
    return phoneNumber.formatInternational();
  } catch (error) {
    console.error('error parsing phone number', number);
    return null;
  }
}

export function formatSex(input: string): Sex {
  switch (input.trim().toLowerCase()) {
    case 'men':
    case 'm':
      return 'M';
    case 'women':
    case 'w':
      return 'W';
    case 'x':
    case 'mixed':
      return 'X';
  }
  throw new Error(`Could not determine sex for input ${input}`);
}
