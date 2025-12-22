/**
 * Centralized date and time formatting utilities using the Intl API.
 * This ensures all dates and times are displayed in the user's local format.
 */

/**
 * Formats a date string or Date object into a long, localized format.
 * Handles potential timezone issues with 'YYYY-MM-DD' strings by treating them as local time.
 * e.g., "September 25, 2024" or "25 September 2024"
 * @param {string | Date} dateInput The date to format.
 * @returns {string} The formatted date string.
 */
export function formatDate(dateInput) {
  if (!dateInput) return 'N/A';
  try {
    let date;
    // If input is a 'YYYY-MM-DD' string, prevent it from being parsed as UTC midnight
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      date = new Date(dateInput + 'T00:00:00');
    } else {
      date = new Date(dateInput);
    }

    // Check if the date is valid after creation
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date value');
    }
    
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'long',
    }).format(date);
  } catch (error) {
    console.error("Invalid date for formatting:", dateInput, error);
    return 'Invalid Date';
  }
}

/**
 * Formats a date string or Date object into a medium, localized format with time.
 * e.g., "Sep 25, 2024, 5:30:00 PM"
 * @param {string | Date} dateInput The date to format.
 * @returns {string} The formatted date and time string.
 */
export function formatDateTime(dateInput) {
    if (!dateInput) return 'N/A';
    try {
        const date = new Date(dateInput);

        if (isNaN(date.getTime())) {
            throw new Error('Invalid date value');
        }

        return new Intl.DateTimeFormat(undefined, {
            dateStyle: 'medium',
            timeStyle: 'medium',
        }).format(date);
    } catch (error) {
        console.error("Invalid date for formatting:", dateInput, error);
        return 'Invalid Date';
    }
}