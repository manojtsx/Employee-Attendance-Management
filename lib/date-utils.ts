import { formatNepaliDate, formatNepaliDateTime } from '@/utils/nepali-date/formatNepaliDate';
import { format } from 'date-fns';

export type DateFormat = 'nepali' | 'english' | 'both';

interface DateFormattingOptions {
  format?: DateFormat;
  includeTime?: boolean;
  timeFormat?: '12h' | '24h';
}

/**
 * Format date with support for both English and Nepali calendars
 */
export const formatDate = (
  date: Date | string,
  options: DateFormattingOptions = {}
): string => {
  const {
    format: dateFormat = 'english', // Default to English for now
    includeTime = false,
    timeFormat = '24h'
  } = options;

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const englishFallback = (d: Date) => {
    if (includeTime) {
      return format(d, timeFormat === '12h' ? 'MMM dd, yyyy hh:mm aa' : 'MMM dd, yyyy HH:mm');
    }
    return format(d, 'MMM dd, yyyy');
  };

  switch (dateFormat) {
    case 'nepali':
      if (includeTime) {
        return formatNepaliDateTime(dateObj, englishFallback);
      }
      return formatNepaliDate(dateObj, englishFallback);
    
    case 'both':
      const nepaliDate = includeTime 
        ? formatNepaliDateTime(dateObj, englishFallback)
        : formatNepaliDate(dateObj, englishFallback);
      const englishDate = englishFallback(dateObj);
      return `${nepaliDate} (${englishDate})`;
    
    case 'english':
    default:
      return englishFallback(dateObj);
  }
};

/**
 * Format time only
 */
export const formatTime = (
  date: Date | string,
  timeFormat: '12h' | '24h' = '24h'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Time';
  }

  return format(dateObj, timeFormat === '12h' ? 'hh:mm aa' : 'HH:mm');
};

/**
 * Format date for table display (short format)
 */
export const formatTableDate = (
  date: Date | string,
  dateFormat: DateFormat = 'english'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const englishFallback = (d: Date) => format(d, 'MMM dd');

  switch (dateFormat) {
    case 'nepali':
      return formatNepaliDate(dateObj, englishFallback);
    case 'both':
      const nepali = formatNepaliDate(dateObj, englishFallback);
      const english = englishFallback(dateObj);
      return `${nepali} (${english})`;
    case 'english':
    default:
      return englishFallback(dateObj);
  }
};

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 */
export const getRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else {
    return formatDate(dateObj, { format: 'english' });
  }
};

/**
 * Check if date is today
 */
export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return dateObj.toDateString() === today.toDateString();
};

/**
 * Get today's date in different formats
 */
export const getToday = (dateFormat: DateFormat = 'english'): string => {
  return formatDate(new Date(), { format: dateFormat });
};
