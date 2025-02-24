export type ValueType =
  | "string"
  | "número"
  | "boolean"
  | "fecha"
  | "array[objeto]"
  | "array[primitivo]"
  | "objeto"
  | "null"
  | "undefined";

export interface TypeConfig {
  id: ValueType;
  label: string;
  color: {
    bg: string;
    text: string;
    border: string;
    dot: string;
  };
  icon?: string; // Para futuros iconos
}

export const TYPE_CONFIG: Record<ValueType, TypeConfig> = {
  string: {
    id: "string",
    label: "Texto",
    color: {
      bg: "bg-green-200",
      text: "text-green-700",
      border: "border-green-200",
      dot: "bg-green-500",
    },
  },
  "número": {
    id: "número",
    label: "Número",
    color: {
      bg: "bg-blue-200",
      text: "text-blue-700",
      border: "border-blue-200",
      dot: "bg-blue-500",
    },
  },
  boolean: {
    id: "boolean",
    label: "Booleano",
    color: {
      bg: "bg-purple-200",
      text: "text-purple-700",
      border: "border-purple-200",
      dot: "bg-purple-500",
    },
  },
  fecha: {
    id: "fecha",
    label: "Fecha",
    color: {
      bg: "bg-pink-200",
      text: "text-pink-700",
      border: "border-pink-200",
      dot: "bg-pink-500",
    },
  },
  "array[objeto]": {
    id: "array[objeto]",
    label: "Lista de objetos",
    color: {
      bg: "bg-orange-200",
      text: "text-orange-700",
      border: "border-orange-200",
      dot: "bg-orange-500",
    },
  },
  "array[primitivo]": {
    id: "array[primitivo]",
    label: "Lista de valores",
    color: {
      bg: "bg-amber-200",
      text: "text-amber-700",
      border: "border-amber-200",
      dot: "bg-amber-500",
    },
  },
  objeto: {
    id: "objeto",
    label: "Objeto",
    color: {
      bg: "bg-yellow-200",
      text: "text-yellow-700",
      border: "border-yellow-200",
      dot: "bg-yellow-500",
    },
  },
  null: {
    id: "null",
    label: "Nulo",
    color: {
      bg: "bg-red-200",
      text: "text-red-700",
      border: "border-red-200",
      dot: "bg-red-500",
    },
  },
  undefined: {
    id: "undefined",
    label: "Indefinido",
    color: {
      bg: "bg-gray-200",
      text: "text-gray-700",
      border: "border-gray-200",
      dot: "bg-gray-500",
    },
  },
}; 