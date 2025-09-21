"use client";

import * as React from "react";
import { ProcessedValue } from "../../core";
import { ObjectCard } from "../../molecules/table-parts/ui/object-card";

interface ObjectCellWrapperProps {
  value: ProcessedValue;
}

export function ObjectCellWrapper({ value }: ObjectCellWrapperProps) {
  if (value.value === null || value.value === undefined) {
    return <span className='text-sm italic text-muted-foreground'>-</span>;
  }

  // Pass the ProcessedValue to the ObjectCard component
  return <ObjectCard value={value} compact={true} />;
}
