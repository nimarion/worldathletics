import * as countries from './countries.json';

export function mapCountryToCode(country: string): string {
  country = normalizeText(country);
  const countryItem = countries.find((c) => {
    return normalizeText(c.countryName) === country
  });
  if (countryItem) {
    return countryItem.id;
  }
  console.error(`Country ${country} not found`);
  return country;
}

function normalizeText(text: string): string {
  text = text.toLowerCase();
  text = text.replace(/ä/g, "ae")
  .replace(/ö/g, "o")
  .replace(/ü/g, "u")
  .replace(/ß/g, "s");
  text = text.replace(/[^a-zA-Z]/g, ' ').replace(/\s+/g, '')
  return text
}

export function findCountryByCode(countryCode: string) {
  const countryItem = countries.find((c) => {
    return c.id === countryCode
  });
  if(countryItem){
    return countryItem;
  }
  return null;
}