import { Logger } from '@nestjs/common';
import countries from './countries.json';

type CountryItem = (typeof countries)[number];

const logger = new Logger('CountryUtils');

const countryByNameMap = new Map<string, string>();
const countryByCodeMap = new Map<string, CountryItem>();

for (const c of countries) {
  const normalizedName = normalizeText(c.countryName);
  if (!countryByNameMap.has(normalizedName)) {
    countryByNameMap.set(normalizedName, c.id);
  }
  if (!countryByCodeMap.has(c.id)) {
    countryByCodeMap.set(c.id, c);
  }
}

export function mapCountryToCode(country: string): string {
  const normalized = normalizeText(country);
  const countryId = countryByNameMap.get(normalized);
  if (countryId) {
    return countryId;
  }
  logger.warn(`Country ${normalized} not found`);
  return normalized;
}

function normalizeText(text: string): string {
  text = text.toLowerCase();
  text = text
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ß/g, 's');
  text = text.replace(/[^a-zA-Z]/g, ' ').replace(/\s+/g, '');
  return text;
}

export function findCountryByCode(countryCode: string): CountryItem | null {
  return countryByCodeMap.get(countryCode) ?? null;
}
