import NepaliDate from './NepaliDate';

/**
 * Formats a Nepali date to a given format string
 * @param date - NepaliDate object
 * @param formatStr - Format string (e.g., "YYYY-MM-DD") or
 * @returns Formatted date string
 */
const format = (date: NepaliDate, formatStr: string): string => {
  const year = date.getYear();
  const month = date.getMonth() + 1; // Convert to 1-indexed
  const day = date.getDate();
  
  return formatStr
    .replace(/YYYY/g, year.toString().padStart(4, '0'))
    .replace(/YY/g, year.toString().slice(-2))
    .replace(/MM/g, month.toString().padStart(2, '0'))
    .replace(/M/g, month.toString())
    .replace(/DD/g, day.toString().padStart(2, '0'))
    .replace(/D/g, day.toString());
};

export default format;
