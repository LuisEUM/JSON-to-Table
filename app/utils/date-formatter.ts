export function toUTCDate(date: string | number | Date): Date {
  const d = new Date(date);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

export function formatDate(date: Date, format: string = "yyyy-MM-dd"): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return format
    .replace("yyyy", year.toString())
    .replace("MM", month)
    .replace("dd", day);
}
