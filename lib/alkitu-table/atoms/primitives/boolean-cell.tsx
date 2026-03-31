"use client";

import * as React from "react";
import { ProcessedValue } from "../../core";
import { Check, X } from "lucide-react";

interface BooleanCellProps {
  value: ProcessedValue;
}

export const BooleanCell = React.memo(function BooleanCell({ value }: BooleanCellProps) {
  if (value.value === null || value.value === undefined) {
    return <span className='text-sm italic text-muted-foreground'>-</span>;
  }

  const boolValue = value.value === true || value.value === "true";

  return (
    <span className='flex items-center justify-center'>
      {boolValue ? (
        <Check className='h-4 w-4 text-green-500' />
      ) : (
        <X className='h-4 w-4 text-red-500' />
      )}
    </span>
  );
});
