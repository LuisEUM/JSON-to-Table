/**
 * Centralized regex patterns used across the data processing pipeline.
 * Compiled once at module level to avoid repeated compilation inside functions.
 */

export const REGEX = {
  /** ISO date format: 2024-01-15T... or 2024-01-15 or 2024-01-15 */
  ISO_DATE: /^\d{4}-\d{2}-\d{2}(T|\s|$)/,

  /** Common date formats: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY */
  COMMON_DATE: /^\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4}/,

  /** Reverse date format: YYYY/MM/DD, YYYY-MM-DD, YYYY.MM.DD */
  REVERSE_DATE: /^\d{4}[\/\.-]\d{1,2}[\/\.-]\d{1,2}/,

  /** ISO or common date combined (for quick checks) */
  ISO_OR_COMMON_DATE: /^\d{4}-\d{2}-\d{2}|^\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4}/,

  /** Timestamp as string: 10-13 digit number */
  TIMESTAMP_STRING: /^\d{10,13}$/,

  /** Numeric-only string */
  NUMERIC_ONLY: /^\d+$/,

  /** Strip surrounding quotes */
  QUOTE_STRIP: /^["']|["']$/g,

  /** Currency, percent, comma, space characters for cleaning numeric values */
  NUMERIC_NOISE: /[$,%\s]/g,

  /** String that looks like a number pattern (3-10 digits possibly with dashes) */
  STRING_NUMBER_PATTERN: /^[\d-]{3,10}$|^\d{2,6}[\s-]?\d{2,4}$/,

  /** Long numeric string (5+ digits) */
  LONG_NUMERIC_STRING: /^\d{5,}$/,

  /** Object representation in string form */
  OBJECT_IN_STRING: /^\{.*\}$/,

  /** Stats nested property */
  STATS_PROPERTY: /\.stats\.|^stats\./,
} as const;
