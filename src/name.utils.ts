export function formatLastname(lastname: string): string {
  return (
    lastname
      .toLowerCase()
      .split(' ')
      .filter((s) => s.length > 0)
      .map((s) => s[0].toUpperCase() + s.slice(1))
      .join(' ')
      // if lastname contains "-" like Skupin-alfa -> capitalize both parts
      .split('-')
      .map((s) => s[0].toUpperCase() + s.slice(1))
      .join('-')
  );
}
