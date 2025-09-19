"use client";

import * as React from "react";
import type { ProcessedValue } from "../../data-processor";
import { isDate } from "../../utils/date-utils";
import { TextCell } from "./text-cell";
import { NumberCell } from "./number-cell";
import { DateCell } from "./date-cell";
import { BooleanCell } from "./boolean-cell";
import { ReferenceCell } from "./reference-cell";
import { ArrayCellWrapper } from "./array-cell-wrapper";
import { ObjectCellWrapper } from "./object-cell-wrapper";
import { NullCell } from "./null-cell";

interface CellFactoryProps {
  value: ProcessedValue;
  isReference?: boolean;
}

/**
 * Detecta el tipo real de un valor independientemente del tipo marcado
 * Esto maneja casos donde el tipado inicial fue incorrecto
 */
function detectRealType(value: ProcessedValue): string {
  const actualValue = value.value;
  
  // Si es null o undefined
  if (actualValue === null) return "null";
  if (actualValue === undefined) return "undefined";
  
  // Si es un array real
  if (Array.isArray(actualValue)) {
    if (actualValue.length === 0) return "array";
    
    // Verificar si todos los elementos son objetos
    const hasObjects = actualValue.some(item => 
      typeof item === "object" && item !== null && !Array.isArray(item)
    );
    
    return hasObjects ? "array[objeto]" : "array[primitivo]";
  }
  
  // Si es una fecha (independientemente del tipo marcado)
  if (isDate(actualValue)) return "fecha";
  
  // Si es un número
  if (typeof actualValue === "number" && !isNaN(actualValue)) return "número";
  
  // Si es booleano
  if (typeof actualValue === "boolean") return "boolean";
  
  // Si es un objeto (no array ni null)
  if (typeof actualValue === "object" && actualValue !== null) return "objeto";
  
  // Por defecto, es string
  return "string";
}

export function CellFactory({ value, isReference = false }: CellFactoryProps) {
  // Handle null, undefined, or missing values
  if (!value) {
    return <span className='text-sm italic text-muted-foreground'>-</span>;
  }

  // Handle references
  if (isReference || value.isReference) {
    return <ReferenceCell value={value} />;
  }

  // Detectar el tipo real del valor (robustez contra tipado incorrecto)
  const realType = detectRealType(value);
  
  // Console log para debugging (remover en producción)
  if (value.type !== realType) {
    console.log(`Tipo corregido: ${value.type} → ${realType}`, {
      originalValue: value.value,
      originalType: value.type,
      detectedType: realType
    });
  }

  // Handle null or undefined
  if (realType === "null") {
    return <NullCell value={value} type='null' />;
  }

  if (realType === "undefined") {
    return <NullCell value={value} type='undefined' />;
  }

  // Handle by REAL type (no el tipo marcado)
  switch (realType) {
    case "string":
      return <TextCell value={value} />;

    case "número":
      return <NumberCell value={value} />;

    case "fecha":
      return <DateCell value={value} />;

    case "boolean":
      return <BooleanCell value={value} />;

    case "array":
    case "array[primitivo]":
    case "array[objeto]":
      return <ArrayCellWrapper value={value} />;

    case "objeto":
      return <ObjectCellWrapper value={value} />;

    default:
      // Fallback to text representation
      return <TextCell value={value} />;
  }
}
