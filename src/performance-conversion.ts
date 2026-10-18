import mapDisciplineToCode, { isTechnical } from './discipline.utils';
import { Performance } from './athletes/athlete.dto';
import { Location } from './location.dto';

// Returns track events in milliseconds and field events in centimeters
export function performanceToFloat({
  performance,
  technical,
}: {
  performance: string;
  technical: boolean;
}): number | null {
  // Empty performance (DNS, DNF, etc.)
  if (performance === '') {
    return null;
  }

  const normalized = performance.trim().replace(',', '.');
  if (normalized === '') {
    return null;
  }

  // Combined Events or One Hour Race
  if (technical) {
    const num = Number(normalized);
    if (!isNaN(num) && num % 1 === 0) {
      return num;
    }
  }

  if (technical) {
    const convertedPerformance = parseFloat(normalized);
    return isNaN(convertedPerformance)
      ? 0
      : Math.round(convertedPerformance * 100);
  }

  const parts = normalized.split(':');

  if (parts.length === 1) {
    const seconds = parseFloat(parts[0]);
    return isNaN(seconds) ? 0 : Math.round(seconds * 1000);
  }

  if (parts.length === 2) {
    const [minutesStr, secondsStr] = parts;
    const minutes = parseInt(minutesStr, 10);
    const seconds = parseFloat(secondsStr);
    if (isNaN(minutes) || isNaN(seconds)) {
      return 0;
    }
    return Math.round((minutes * 60 + seconds) * 1000);
  }

  if (parts.length === 3) {
    const [hoursStr, minutesStr, secondsStr] = parts;
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    const seconds = parseFloat(secondsStr);
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      return 0;
    }
    return Math.round((hours * 3600 + minutes * 60 + seconds) * 1000);
  }

  throw new Error(`Invalid performance: ${performance}`);
}

export function toPerformanceFields({
  discipline,
  mark,
  disciplineCode = mapDisciplineToCode(discipline),
}: {
  discipline: string;
  mark: string;
  disciplineCode?: string;
}) {
  const technical = isTechnical({
    disciplineCode,
    performance: mark,
  });
  return {
    discipline,
    disciplineCode,
    mark,
    isTechnical: technical,
    performanceValue: performanceToFloat({
      performance: mark,
      technical,
    }),
  };
}

export function toPerformance({
  date,
  discipline,
  disciplineCode,
  mark,
  venue,
  notLegal,
  resultScore,
  wind,
  competition = null,
  category = null,
  race = null,
  place = null,
  records = [],
  competitionId,
  eventId,
}: {
  date: Date | null;
  discipline: string;
  disciplineCode?: string;
  mark: string;
  venue: Location;
  notLegal: boolean;
  resultScore: number;
  wind: number | null;
  competition?: string | null;
  category?: string | null;
  race?: string | null;
  place?: number | null;
  records?: string[];
  competitionId: number | null;
  eventId: number | null;
}): Performance {
  return {
    ...toPerformanceFields({ discipline, mark, disciplineCode }),
    date,
    location: venue,
    legal: !notLegal,
    resultScore,
    wind,
    competition,
    category,
    race,
    place,
    records,
    competitionId,
    eventId,
  };
}
