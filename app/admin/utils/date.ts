const heFormatter = new Intl.DateTimeFormat("he-IL", { timeZone: "UTC" });

export function formatDateHe(value?: string | number | Date | null) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return heFormatter.format(date);
}
