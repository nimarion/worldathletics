import { Location } from './athletes/location.dto';

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
  const regex = /^(.*)\s+([A-Z\s]+)$/;
  const match = name.match(regex);

  if (match) {
    return {
      firstname: match[1].trim(),
      lastname: formatLastname(match[2].trim()),
    };
  }
}

export function cleanupMark(mark: string): string {
  return mark.replace(/[^0-9:.]/g, '');
}

export function cleanupCompetitionName(competitionName: string) {
  return competitionName.replace(' (i)', '').split(',')[0];
}

export function isShortTrack(discipline: string): boolean {
  return discipline.endsWith('Short Track');
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
