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
