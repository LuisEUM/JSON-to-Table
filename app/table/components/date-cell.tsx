"use client";

import { formatDateString } from "../utils/date-formatter";

interface DateCellProps {
  value: Date | string | number;
}

export function DateCell({ value }: DateCellProps) {
  const formattedDate = formatDateString(value);

  return (
    <span
      className='text-sm text-center font-mono truncate'
      title={formattedDate}
    >
      {formattedDate}
    </span>
  );
}
