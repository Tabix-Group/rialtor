/**
 * Utility functions for safe date parsing and formatting
 * Handles UTC/timezone issues when parsing YYYY-MM-DD date strings
 */

/**
 * Parse a date string (YYYY-MM-DD) as local date, not UTC
 * This fixes the off-by-one day issue when displaying dates with weekday
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Date object representing the local date
 */
export function parseLocalDate(dateString: string): Date {
  if (!dateString) return new Date();
  
  // Parse YYYY-MM-DD and create date in local timezone (not UTC)
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format a date string (YYYY-MM-DD) displaying local date with optional weekday
 * @param dateString - Date in YYYY-MM-DD format
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date string
 */
export function formatLocalDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string {
  if (!dateString) return '';
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString('es-AR', options);
}

/**
 * Format a date with full weekday name
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Formatted string like "martes, 11 de marzo de 2026"
 */
export function formatDateWithWeekday(dateString: string): string {
  return formatLocalDate(dateString, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format a date with short format including weekday
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Formatted string like "mar, 11 de mar"
 */
export function formatDateShort(dateString: string): string {
  return formatLocalDate(dateString, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Get the day of the week as a number (0 = Sunday, ... 6 = Saturday)
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Day of week (0-6)
 */
export function getDayOfWeek(dateString: string): number {
  const date = parseLocalDate(dateString);
  return date.getDay();
}

/**
 * Get the day name in Spanish
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Day name (lunes, martes, etc.)
 */
export function getDayName(dateString: string): string {
  return formatLocalDate(dateString, { weekday: 'long' });
}
