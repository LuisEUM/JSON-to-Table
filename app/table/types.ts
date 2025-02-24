export type ValueType =
  | "string"
  | "texto"
  | "número"
  | "boolean"
  | "booleano"
  | "fecha"
  | "array"
  | "array[texto]"
  | "array[número]"
  | "array[booleano]"
  | "array[fecha]"
  | "array[objeto]"
  | "array[mixto]"
  | "array[vacío]"
  | "objeto"
  | "referencia"
  | "null"
  | "undefined";

export interface ProcessedValue {
  value: unknown;
  type: ValueType;
  items?: ProcessedValue[];
  parentId?: string;
  __parentId?: string;
  rawValue?: unknown;
  label?: string;
  title?: string;
  isReference?: boolean;
  path?: string[];
}

export interface ProcessedItem extends ProcessedValue {
  id: string;
  path: string[];
  groups?: string[];
  isId?: boolean;
}

export type ProcessedRow = Record<string, ProcessedItem>; 