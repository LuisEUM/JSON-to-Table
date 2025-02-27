"use client";

import * as React from "react";
import type { ProcessedValue } from "../../data-processor";

interface NullCellProps {
  value: ProcessedValue;
  type: "null" | "undefined";
}

export function NullCell({ type }: NullCellProps) {
  return (
    <span className='text-sm italic text-muted-foreground'>
      {type === "null" ? "null" : "undefined"}
    </span>
  );
}
