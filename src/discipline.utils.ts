import * as disciplines from './disciplines.json';

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
  console.error(`Discipline ${discipline} not found`);
  return discipline;
}

export function cleanupDiscipline(discipline: string): string {
  discipline = discipline
    .replace("Women's ", '')
    .replace("Men's ", '')
    .replace('Mixed ', '')
    .replace(' sh', '')
    .replace('Short Track', '').trim();
  if(discipline.endsWith('m')) {
    discipline  = discipline.substring(0, discipline.length - 1) + ' Metres';
  }
  if(discipline.includes('km')) {
    discipline = discipline.replace('km', ' Kilometres');
  }
  return discipline;
}

export function isTechnical({
  disciplineCode,
  performance,
}: {
  disciplineCode: string;
  performance: string;
}): boolean {
  const containsDigits = /\d/.test(disciplineCode);
  if (containsDigits) {
    return false;
  }
  if (performance.includes(':')) {
    return false;
  }
  return true;
}
