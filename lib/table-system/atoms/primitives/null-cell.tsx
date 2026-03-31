"use client";

import * as React from "react";
import { ProcessedValue } from "../../core";

interface NullCellProps {
  value: ProcessedValue;
  type: "null" | "undefined";
}

export const NullCell = React.memo(function NullCell({ type }: NullCellProps) {
  return (
    <span className='text-sm italic text-muted-foreground'>
      {type === "null" ? "null" : "undefined"}
    </span>
  );
});
