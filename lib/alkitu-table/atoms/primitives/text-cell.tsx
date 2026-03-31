"use client";

import * as React from "react";
import { ProcessedValue } from "../../core";

interface TextCellProps {
  value: ProcessedValue;
}

export const TextCell = React.memo(function TextCell({ value }: TextCellProps) {
  if (value.value === null || value.value === undefined) {
    return <span className='text-sm italic text-muted-foreground'>-</span>;
  }

  return <span className='text-sm'>{String(value.value)}</span>;
});
