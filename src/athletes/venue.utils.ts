import { Location } from './location.dto';

export default function parseVenue(venue: string): Location {
  venue = venue.trim();
  const parts = venue.split(', ');
  if (parts.length === 1) {
    const [city, country] = parseCountryAndCity(parts[0]);
    return {
      country,
      city,
    };
  }
  const [stadium, rest] = parts;
  const [city, country] = parseCountryAndCity(rest);
  return {
    stadium,
    city,
    country,
  };
}

function parseCountryAndCity(countryAndCity: string): [string, string] {
  console.log(countryAndCity);
  const regex = /(.+?)\s*\((\w+(?:\s+\w+)*)\)/;
  const matchResult = countryAndCity.match(regex);
  if (!matchResult) {
    throw new Error(`Cannot parse country and city from ${countryAndCity}`);
  }
  const city = matchResult[1];
  const country = matchResult[2];
  return [city, country];
}
