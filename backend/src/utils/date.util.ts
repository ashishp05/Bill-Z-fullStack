// Invoice dates are calendar dates (Postgres DATE). They are handled as UTC midnight.
export const parseDateOnly = (value: string): Date => new Date(`${value}T00:00:00.000Z`);

export const formatDateOnly = (value: Date): string => value.toISOString().slice(0, 10);

// Bill-Z serves Indian businesses: "today" (default invoice date, overdue checks) is the IST date.
const BUSINESS_TIME_ZONE = 'Asia/Kolkata';

export const todayDateOnly = (): Date =>
  parseDateOnly(
    new Intl.DateTimeFormat('en-CA', { timeZone: BUSINESS_TIME_ZONE }).format(new Date()),
  );

export const addDays = (value: Date, days: number): Date =>
  new Date(value.getTime() + days * 24 * 60 * 60 * 1000);
