const pad = (n) => String(n).padStart(2, '0');

export function toKey(year, month, day) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function parseKey(key) {
  const [year, month, day] = key.split('-').map(Number);
  return { year, month, day };
}

export function todayKey() {
  const now = new Date();
  return toKey(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function addDays(key, amount) {
  const { year, month, day } = parseKey(key);
  const date = new Date(Date.UTC(year, month - 1, day + amount));
  return toKey(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

export function addMonths({ year, month }, amount) {
  const date = new Date(Date.UTC(year, month - 1 + amount, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

export function monthOf(key) {
  const { year, month } = parseKey(key);
  return { year, month };
}

export function isInMonth(key, { year, month }) {
  const parsed = parseKey(key);
  return parsed.year === year && parsed.month === month;
}

export function monthGrid({ year, month }) {
  const leadingDays = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const rows = Math.ceil((leadingDays + daysInMonth) / 7);
  const firstShown = addDays(toKey(year, month, 1), -leadingDays);

  const days = [];
  for (let i = 0; i < rows * 7; i++) {
    days.push(addDays(firstShown, i));
  }
  return days;
}

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function monthLabel({ year, month }) {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function longDayLabel(key) {
  const { year, month, day } = parseKey(key);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
