import { Logger } from '@nestjs/common';
import disciplines from './disciplines.json';

const logger = new Logger('DisciplineUtils');

const TECHNICAL_CODE_PREFIXES =
  /^(HJ|PV|LJ|TJ|SP|DT|HT|JT|WT|PEN|HEP|OCT|DEC|HOUR)/;

const NON_TECHNICAL_CODE_PREFIXES =
  /^(MILE|HMAR|MAR|MEAD|EKID|DISMEAD|MIXREL|SHUTHUR|XSE|XJ|XC|XS|RR)/;

const disciplineToCodeMap = new Map<string, string>([
  // Not present in getMetaData > disciplineCodes
  ['3x800 Metres Relay', '3X8'],
]);

for (const d of disciplines) {
  if (!disciplineToCodeMap.has(d.discipline)) {
    const code = d.disciplineCode.endsWith('sh')
      ? d.disciplineCode.slice(0, -2)
      : d.disciplineCode;
    disciplineToCodeMap.set(d.discipline, code);
  }
}

export default function mapDisciplineToCode(discipline: string): string {
  // Prefix is present in getCalendarEvents query
  discipline = cleanupDiscipline(discipline);
  const disciplineCode = disciplineToCodeMap.get(discipline);
  if (disciplineCode) {
    return disciplineCode;
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
