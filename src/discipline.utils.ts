import { Logger } from '@nestjs/common';
import disciplines from './disciplines.json';

const logger = new Logger('DisciplineUtils');

const TECHNICAL_CODE_PREFIXES =
  /^(HJ|PV|LJ|TJ|SP|DT|HT|JT|WT|PEN|HEP|OCT|DEC|HOUR)/;

const NON_TECHNICAL_CODE_PREFIXES =
  /^(MILE|HMAR|MAR|MEAD|EKID|DISMEAD|MIXREL|SHUTHUR|XSE|XJ|XC|XS|RR)/;

export default function mapDisciplineToCode(discipline: string): string {
  // Prefix is present in getCalendarEvents query
  discipline = cleanupDiscipline(discipline);
  // Not present in getMetaData > disciplineCodes
  if (discipline == '3x800 Metres Relay') {
    return '3X8';
  }
  const disciplineItem = disciplines.find((d) => d.discipline === discipline);
  if (disciplineItem) {
    const disciplineCode = disciplineItem.disciplineCode;
    if (disciplineCode.endsWith('sh')) {
      return disciplineCode.substring(0, disciplineCode.length - 2);
    }
    return disciplineItem.disciplineCode;
  }
  logger.warn(`Discipline ${discipline} not found`);
  return discipline;
}

export function cleanupDiscipline(discipline: string): string {
  return discipline
    .replace("Women's ", '')
    .replace("Men's ", '')
    .replace('Mixed ', '')
    .replace(' sh', '')
    .replace('Short Track', '')
    .trim();
}

export function isTechnical({
  disciplineCode,
  performance,
}: {
  disciplineCode: string;
  performance: string;
}): boolean {
  if (TECHNICAL_CODE_PREFIXES.test(disciplineCode)) {
    return true;
  }
  if (
    NON_TECHNICAL_CODE_PREFIXES.test(disciplineCode) ||
    /\d/.test(disciplineCode)
  ) {
    return false;
  }
  if (performance.includes(':')) {
    return false;
  }
  return true;
}
