export type AvailableType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "null"
  | "undefined"
  | "object"
  | "array"
  | "primitiveArray"
  | "objectArray"
  | "unknown";

export const AVAILABLE_TYPES: AvailableType[] = [
  "string",
  "number",
  "boolean",
  "date",
  "null",
  "undefined",
  "object",
  "array",
  "primitiveArray",
  "objectArray",
];

interface TypeStyle {
  bg: string;
  text: string;
  border: string;
}

const TYPE_STYLES: Record<AvailableType, TypeStyle> = {
  string: {
    bg: "bg-green-200",
    text: "text-green-700",
    border: "border-green-200",
  },
  number: {
    bg: "bg-blue-200",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  boolean: {
    bg: "bg-purple-200",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  date: {
    bg: "bg-pink-200",
    text: "text-pink-700",
    border: "border-pink-200",
  },
  null: {
    bg: "bg-red-200",
    text: "text-red-700",
    border: "border-red-200",
  },
  undefined: {
    bg: "bg-gray-200",
    text: "text-gray-700",
    border: "border-gray-200",
  },
  object: {
    bg: "bg-yellow-200",
    text: "text-yellow-700",
    border: "border-yellow-200",
  },
  array: {
    bg: "bg-orange-200",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  primitiveArray: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    border: "border-orange-100",
  },
  objectArray: {
    bg: "bg-orange-300",
    text: "text-orange-800",
    border: "border-orange-300",
  },
  unknown: {
    bg: "bg-gray-200",
    text: "text-gray-700",
    border: "border-gray-200",
  },
};

export function getTypeStyle(type: string): TypeStyle {
  return TYPE_STYLES[type as AvailableType] || TYPE_STYLES.unknown;
}

const TYPE_LABELS: Record<AvailableType, string> = {
  string: "Texto",
  number: "Número",
  boolean: "Booleano",
  date: "Fecha",
  null: "Nulo",
  undefined: "Indefinido",
  object: "Objeto",
  array: "Array",
  primitiveArray: "Array de primitivos",
  objectArray: "Array de objetos",
  unknown: "Desconocido",
};

export function getTypeLabel(type: string): string {
  return TYPE_LABELS[type as AvailableType] || type;
}
