"use client";

import * as React from "react";
import type { ProcessedValue } from "../../data-processor";
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

export function CellFactory({ value, isReference = false }: CellFactoryProps) {
  // Handle null, undefined, or missing values
  if (!value) {
    return <span className='text-sm italic text-muted-foreground'>-</span>;
  }

  // Handle references
  if (isReference || value.isReference) {
    return <ReferenceCell value={value} />;
  }

  // Handle null or undefined
  if (value.type === "null") {
    return <NullCell value={value} type='null' />;
  }

  if (value.type === "undefined") {
    return <NullCell value={value} type='undefined' />;
  }

  // Handle by type
  switch (value.type) {
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
