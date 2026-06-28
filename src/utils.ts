import {
  formatIncompletePhoneNumber,
  isValidPhoneNumber,
  parseIncompletePhoneNumber,
  parsePhoneNumberWithError,
} from 'libphonenumber-js/max';
import { Location } from './location.dto';
import { Sex } from './athletes/athlete.dto';

export function formatLastname(lastname: string): string {
  lastname = lastname.trim();
  if (lastname === '') {
    return '';
  }

  const capitalize = (s: string): string => {
    if (!s) return s;

    // If all characters are the same (e.g., "II", "AAA"), keep original
    if (s.length > 1 && s === s[0].repeat(s.length)) {
      return s;
    }

    // Capitalize parts separated by apostrophe (e.g., "O'CONNOR" -> "O'Connor")
    if (s.includes("'")) {
      return s.split("'").map(capitalize).join("'");
    }

    return s[0].toUpperCase() + s.slice(1).toLowerCase();
  };

  return lastname
    .split(' ')
    .filter((s) => s.length > 0)
    .map((part) =>
      part
        .split('-') // if lastname contains "-" like Skupin-alfa -> capitalize both parts
        .map(capitalize)
        .join('-'),
    )
    .join(' ');
}

export function extractName(name: string) {
  const regex = /^(.*?)\s+([A-Z\s\W]+)$/;
  const match = name.match(regex);

  if (match) {
    return {
      firstname: match[1].trim(),
      lastname: formatLastname(match[2].trim()),
    };
  }

  // Fallback: split by the last space if available
  const trimmed = name.trim();
  const lastSpaceIndex = trimmed.lastIndexOf(' ');
  if (lastSpaceIndex !== -1) {
    return {
      firstname: trimmed.slice(0, lastSpaceIndex).trim(),
      lastname: formatLastname(trimmed.slice(lastSpaceIndex + 1)),
    };
  }

  // Fallback for single-word names
  return {
    firstname: '',
    lastname: formatLastname(trimmed),
  };
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
  const city = matchResult[1].replace(/, [A-Z]+$/, '').trim();
  const country = matchResult[2].trim();
  return [city, country];
}

export function isIndoor(venue: string): boolean {
  return venue.endsWith('(i)');
}

export function parsePhoneNumber(number: string): string | null {
  let cleaned = number.trim();

  // Remove common European trunk prefix representation, e.g. +44 (0) 77 -> +44 77
  cleaned = cleaned
    .replace(/\s*\(0\)\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // If it does not start with '+' and is not a valid US number,
  // try prepending '+' to see if it is a valid international number.
  if (!cleaned.startsWith('+')) {
    if (!isValidPhoneNumber(cleaned, 'US')) {
      const withPlus = `+${cleaned}`;
      if (isValidPhoneNumber(withPlus, 'US')) {
        cleaned = withPlus;
      }
    }
  }

  if (!isValidPhoneNumber(cleaned, 'US')) {
    const incompleteCleaned = parseIncompletePhoneNumber(cleaned);
    if (isValidPhoneNumber(incompleteCleaned, 'US')) {
      cleaned = formatIncompletePhoneNumber(cleaned);
    } else if (
      !cleaned.startsWith('+') &&
      isValidPhoneNumber(`+${incompleteCleaned}`, 'US')
    ) {
      cleaned = `+${incompleteCleaned}`;
    } else {
      return null;
    }
  }

  try {
    const phoneNumber = parsePhoneNumberWithError(cleaned, 'US');
    if (!phoneNumber) return null;
    return phoneNumber.formatInternational();
  } catch (error) {
    return null;
  }
}

export function formatSex(input: string): Sex {
  switch (input.trim().toLowerCase()) {
    case 'men':
    case 'male':
    case 'man':
    case 'm':
      return 'M';
    case 'women':
    case 'female':
    case 'woman':
    case 'w':
      return 'W';
    case 'x':
    case 'mixed':
      return 'X';
  }
  throw new Error(`Could not determine sex for input ${input}`);
}
