"use client";

import * as React from "react";
import type { ProcessedValue } from "../../data-processor";

interface TextCellProps {
  value: ProcessedValue;
}

export function TextCell({ value }: TextCellProps) {
  if (value.value === null || value.value === undefined) {
    return <span className='text-sm italic text-muted-foreground'>-</span>;
  }

  return <span className='text-sm'>{String(value.value)}</span>;
}
