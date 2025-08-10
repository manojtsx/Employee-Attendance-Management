/**
 * Date utilities for consistent timezone handling in the attendance system
 */

/**
 * Get today's date as a UTC date at midnight
 * This ensures consistent date handling across different timezones
 */
export function getTodayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

/**
 * Get a specific date as UTC at midnight
 * @param date - The date to convert
 */
export function getDateUTC(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

/**
 * Check if two dates are the same day (ignoring time)
 * @param date1 - First date
 * @param date2 - Second date
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Get the start of day in UTC for a given date
 * @param date - The date to get start of day for
 */
export function getStartOfDayUTC(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

/**
 * Get the end of day in UTC for a given date
 * @param date - The date to get end of day for
 */
export function getEndOfDayUTC(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999));
}
