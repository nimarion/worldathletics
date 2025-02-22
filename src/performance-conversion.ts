// Returns track events in milliseconds and field events in centimeters
export function performanceToFloat({
  performance,
  technical,
}: {
  performance: string;
  technical: boolean;
}): number | null {
  // Empty performance (DNS, DNF, etc.)
  if(performance === ""){
    return null;
  }
  // Combined Events or One Hour Race
  if(technical && !isNaN(Number(performance)) && Number(performance) % 1 === 0) {
    return Number(performance);
  }
  performance = performance.trim().replace(',', '.');

  if (technical) {
    const convertedPerformance = parseFloat(performance);
    return isNaN(convertedPerformance)
      ? 0
      : Math.round(convertedPerformance * 100);
  }

  const parts = performance.split(':');

  if (parts.length === 1) {
    return parseFloat(parts[0]) * 1000 | 0;
  }

  if (parts.length === 2) {
    const [minutes, rest] = parts;
    const seconds = parseFloat(rest);
    return (parseInt(minutes) * 60 + seconds) * 1000 | 0;
  }

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts.map((part) => parseInt(part));
    return (hours * 3600 + minutes * 60 + seconds) * 1000 | 0;
  }

  throw new Error(`Invalid performance: ${performance}`);
}
