/**
 * Configurable field name patterns used by the type inference and data processing systems.
 * Centralizes all hardcoded field name checks so they can be maintained and extended easily.
 */

// ─── Object field patterns ───────────────────────────────────────────────────

/** Patterns for fields that are expected to contain objects */
export const OBJECT_FIELD_PATTERNS: RegExp[] = [
  /^(supplier|client|customer|bill|address|shipping|contact|location|payment|invoice|person).*record$/i,
  /^.*[aA]ddress$/,
  /^.*[rR]ecord$/,
  /^(user|profile|account|config|settings|options|details|info|data|meta)$/i,
];

/** Known specific object field names (exact matches) */
export const KNOWN_OBJECT_FIELDS: string[] = [
  "supplierRecord",
  "billAddress",
  "clientRecord",
];

// ─── Date field patterns ─────────────────────────────────────────────────────

/** Patterns for field names that strongly suggest a date/timestamp column */
export const DATE_FIELD_PATTERNS: RegExp[] = [
  /^(created|updated|modified|date|timestamp|time)(at|on|_at|_on)?$/i,
];

/** Broader date patterns used in batch processing for secondary detection */
export const BROAD_DATE_FIELD_PATTERNS: RegExp[] = [
  /^(created|updated|modified|fecha|date|time|timestamp)/i,
  /(at|on|date|time|fecha|timestamp|creacion|modificacion)$/i,
  /^(create|update|modify)_(time|date|at|on)$/i,
  /^(fecha|date)_(creacion|modificacion|created|updated)$/i,
];

/** Standard date field names that are always treated as dates when non-null */
export const STANDARD_DATE_FIELDS: string[] = ["createdAt", "updatedAt"];

// ─── Postal code / zip code patterns ─────────────────────────────────────────

export const POSTAL_FIELD_PATTERNS: RegExp[] = [
  /^(postal|zip|cp|codigo.*postal|post.*code|postcode)$/i,
];

// ─── ID field patterns ──────────────────────────────────────────────────────

export const ID_FIELD_PATTERNS: RegExp[] = [
  /^id$/i,
  /^_id$/i,
  /Id$/,
  /ID$/,
  /^id[A-Z]/,
  /^ID[A-Z]/,
];

// ─── Text / array field patterns ────────────────────────────────────────────

/** Fields that should always be treated as array[objeto] by name convention */
export const TEXT_ARRAY_FIELD_PATTERNS: RegExp[] = [
  /^(notes|comments|notas|comentarios)$/i,
];

/** Patterns that suggest an array column when arrays are empty */
export const ARRAY_COLUMN_NAME_PATTERNS: RegExp[] = [
  /^(.*items|.*list|.*collection|.*set|.*array|.*records|.*data|.*entries|.*elements)$/i,
  /(items|notes|comments|details|elementos|detalles|opciones|records)$/i,
];

// ─── Object field pattern for flattening (subset used in processBatchData) ──

export const FLATTEN_OBJECT_PATTERNS: RegExp[] = [
  /^.*[aA]ddress$/,
  /^.*[rR]ecord$/,
];

// ─── Utility ────────────────────────────────────────────────────────────────

/**
 * Test whether a field name matches any of the given regex patterns.
 */
export function matchesFieldPattern(
  fieldName: string,
  patterns: RegExp[]
): boolean {
  return patterns.some((p) => p.test(fieldName));
}

/**
 * Test whether a field name is one of the known exact-match names.
 */
export function isKnownField(
  fieldName: string,
  knownFields: string[]
): boolean {
  return knownFields.includes(fieldName);
}
