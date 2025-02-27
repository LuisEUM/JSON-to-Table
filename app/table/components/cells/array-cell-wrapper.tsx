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

  // Pass the items from the ProcessedValue to the ArrayCell component
  return <ArrayCell items={value.items || []} />;
}
