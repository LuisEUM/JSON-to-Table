"use client";

import * as React from "react";
import { ProcessedValue } from "../../core";
import { Link } from "lucide-react";

interface ReferenceCellProps {
  value: ProcessedValue;
}

export function ReferenceCell({ value }: ReferenceCellProps) {
  if (value.value === null || value.value === undefined) {
    return <span className='text-sm italic text-muted-foreground'>-</span>;
  }

  // For now just display the reference ID with a link icon
  return (
    <div className='flex items-center gap-1 text-sm'>
      <Link className='h-3 w-3 text-blue-500' />
      <span className='text-blue-500 underline cursor-pointer'>
        {String(value.value)}
      </span>
    </div>
  );
}
