"use client";

import * as React from "react";
import { ProcessedValue } from "../../core";
import { formatDateString } from "../../core/utils/date-formatter";


interface DateCellProps {
  value: ProcessedValue;
}

export const DateCell = React.memo(function DateCell({ value }: DateCellProps) {
  if (value.value === null || value.value === undefined) {
    return <span className='text-sm italic text-muted-foreground'>-</span>;
  }

  try {
    const formattedDate = formatDateString(value.value as string);
    return <span className='text-sm'>{formattedDate}</span>;
  } catch {
    return (
      <span className='text-sm italic text-muted-foreground'>Invalid date</span>
    );
  }
});
