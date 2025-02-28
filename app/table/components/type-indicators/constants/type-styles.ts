export type AvailableType =
  | "string"
  | "número"
  | "boolean"
  | "fecha"
  | "null"
  | "undefined"
  | "objeto"
  | "array"
  | "array[primitivo]"
  | "array[objeto]"
  | "unknown";

export const AVAILABLE_TYPES: AvailableType[] = [
  "string",
  "número",
  "boolean",
  "fecha",
  "null",
  "undefined",
  "objeto",
  "array",
  "array[primitivo]",
  "array[objeto]",
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
  número: {
    bg: "bg-blue-200",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  boolean: {
    bg: "bg-purple-200",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  fecha: {
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
  objeto: {
    bg: "bg-yellow-200",
    text: "text-yellow-700",
    border: "border-yellow-200",
  },
  array: {
    bg: "bg-orange-200",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  "array[primitivo]": {
    bg: "bg-orange-100",
    text: "text-orange-800",
    border: "border-orange-100",
  },
  "array[objeto]": {
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
  número: "Número",
  boolean: "Booleano",
  fecha: "Fecha",
  null: "Nulo",
  undefined: "Indefinido",
  objeto: "Objeto",
  array: "Array",
  "array[primitivo]": "Array de primitivos",
  "array[objeto]": "Array de objetos",
  unknown: "Desconocido",
};

export function getTypeLabel(type: string): string {
  return TYPE_LABELS[type as AvailableType] || type;
}
