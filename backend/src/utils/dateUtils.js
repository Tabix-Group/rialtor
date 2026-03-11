/**
 * Date utilities for timezone-safe date handling
 * Fixes JavaScript's timezone issue with YYYY-MM-DD string parsing
 */

/**
 * Parse a YYYY-MM-DD string as a local date (not UTC)
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {Date} Date object at midnight in local timezone
 */
function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get the day name for a date string
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @param {string} locale - Locale string (default: 'es-AR')
 * @returns {string} Day name (e.g., "lunes", "martes", etc.)
 */
function getDayName(dateString, locale = 'es-AR') {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString(locale, { weekday: 'long' });
}

/**
 * Format a date string in local timezone with full details
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @param {string} locale - Locale string (default: 'es-AR')
 * @returns {string} Formatted date with day name
 */
function formatDateWithWeekday(dateString, locale = 'es-AR') {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format a date string with short format
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @param {string} locale - Locale string (default: 'es-AR')
 * @returns {string} Short formatted date
 */
function formatDateShort(dateString, locale = 'es-AR') {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Get day of week number (0 = Sunday, 6 = Saturday)
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {number} Day of week
 */
function getDayOfWeek(dateString) {
  const date = parseLocalDate(dateString);
  return date.getDay();
}

module.exports = {
  parseLocalDate,
  getDayName,
  formatDateWithWeekday,
  formatDateShort,
  getDayOfWeek
};
