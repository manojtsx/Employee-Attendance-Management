import NepaliDate from "./NepaliDate";

/**
 * Formats a date to Nepali format (e.g., "Shrawan 7, 2082")
 * @param date - Date string, Date object, or timestamp
 * @param fallbackFormat - Optional fallback format if conversion fails
 * @returns Formatted Nepali date string
 */
export const formatNepaliDate = (
  date: Date,
  fallbackFormat: (date: Date) => string
) => {
  try {
    const dateObj = new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      if (fallbackFormat) {
        return fallbackFormat(dateObj);
      }
      return "Invalid Date";
    }
    
    const nepaliDate = new NepaliDate(dateObj);
    const nepaliMonths = [
      'Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Aswin',
      'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
    ];
    
    const monthName = nepaliMonths[nepaliDate.getMonth()];
    return `${monthName} ${nepaliDate.getDate()}, ${nepaliDate.getYear()}`;
  } catch (error) {
    console.error('Error parsing date:', date, error);
    
    if (fallbackFormat) {
      try {
        return fallbackFormat(new Date(date));
      } catch {
        return "Invalid Date";
      }
    }
    
    return "Invalid Date";
  }
};

/**
 * Formats a date to Nepali format with time (e.g., "Shrawan 7, 2082 14:30")
 * @param date - Date string, Date object, or timestamp
 * @param fallbackFormat - Optional fallback format if conversion fails
 * @returns Formatted Nepali date and time string
 */
export const formatNepaliDateTime = (
  date: Date,
  fallbackFormat?: (date: Date) => string
) => {
  try {
    const dateObj = new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      if (fallbackFormat) {
        return fallbackFormat(dateObj);
      }
      return "Invalid Date";
    }
    
    const nepaliDate = new NepaliDate(dateObj);
    const nepaliMonths = [
      'Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Aswin',
      'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
    ];
    
    const monthName = nepaliMonths[nepaliDate.getMonth()];
    const timeString = dateObj.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    return `${monthName} ${nepaliDate.getDate()}, ${nepaliDate.getYear()} ${timeString}`;
  } catch (error) {
    console.error('Error parsing date:', date, error);
    
    if (fallbackFormat) {
      try {
        return fallbackFormat(new Date(date));
      } catch {
        return "Invalid Date";
      }
    }
    
    return "Invalid Date";
  }
};