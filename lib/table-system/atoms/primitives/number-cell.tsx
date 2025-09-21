"use client";

import * as React from "react";
import { ProcessedValue } from "../../core";

interface NumberCellProps {
  value: ProcessedValue;
}

export function NumberCell({ value }: NumberCellProps) {
  if (value.value === null || value.value === undefined) {
    return <span className='text-sm italic text-muted-foreground'>-</span>;
  }

  // Format number if needed
  const numValue = Number(value.value);
  return (
    <span className='text-sm font-mono'>
      {isNaN(numValue) ? String(value.value) : numValue}
    </span>
  );
}
