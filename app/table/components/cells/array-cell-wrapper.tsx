"use client";

import * as React from "react";
import type { ProcessedValue } from "../../data-processor";
import { ArrayCell } from "../ui/array-cell";

interface ArrayCellWrapperProps {
  value: ProcessedValue;
}

export function ArrayCellWrapper({ value }: ArrayCellWrapperProps) {
  if (value.value === null || value.value === undefined) {
    return <span className='text-sm italic text-muted-foreground'>-</span>;
  }

  // Verificación robusta: Si el valor no es realmente un array,
  // no usar ArrayCell (esto maneja datos mal tipados)
  if (!Array.isArray(value.value)) {
    // Si no es array pero tiene items, usar los items
    if (value.items && value.items.length > 0) {
      return <ArrayCell items={value.items} />;
    }
    
    // Si no es array y no tiene items, renderizar como valor simple
    return (
      <span className="text-sm">
        {String(value.value)}
      </span>
    );
  }

  // Pass the items from the ProcessedValue to the ArrayCell component
  return <ArrayCell items={value.items || []} />;
}
