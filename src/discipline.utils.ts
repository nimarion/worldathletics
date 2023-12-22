import * as disciplines from './disciplines.json';

export default function mapDisciplineToCode(discipline: string): string {
  const disciplineItem = disciplines.find((d) => d.discipline === discipline);
  if (disciplineItem) {
    return disciplineItem.disciplineCode;
  }
  throw new Error(`Discipline ${discipline} not found`);
}
