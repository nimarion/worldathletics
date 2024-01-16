import * as disciplines from './disciplines.json';

export default function mapDisciplineToCode(discipline: string): string {
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
  return discipline;
}
