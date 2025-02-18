"use client";

import type { ReactElement } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TypeDot } from "./type-dot";
import type { ProcessedValue } from "../data-processor";

interface ObjectCardProps {
  value: ProcessedValue;
  level?: number;
  compact?: boolean;
}

const renderValue = (
  value: ProcessedValue,
  level = 0,
  compact = false
): ReactElement => {
  if (value.type === "objeto") {
    return <ObjectCard value={value} level={level + 1} compact={compact} />;
  }

  if (value.type === "array") {
    return (
      <div className='flex flex-col gap-1.5 mt-1.5'>
        {value.items?.map((item, idx) => (
          <div key={`array-item-${idx}`} className='flex items-center gap-2'>
            <span className='text-xs text-gray-500 w-5 text-right'>
              {idx + 1}.
            </span>
            <div className='flex-1'>{renderValue(item, level, compact)}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <span className='text-sm font-mono'>
      {value.type === "string"
        ? `"${String(value.value)}"`
        : String(value.value)}
    </span>
  );
};

export function ObjectCard({
  value,
  level = 0,
  compact = false,
}: ObjectCardProps): ReactElement {
  if (value.type !== "objeto") return renderValue(value, level, compact);

  const obj = value.value as Record<string, ProcessedValue>;

  return (
    <Card
      className={`inline-block border shadow-sm ${level > 0 ? "mt-2" : ""}`}
    >
      <CardContent
        className={`p-3 space-y-2 ${
          compact ? "max-h-[300px] overflow-y-auto" : ""
        }`}
      >
        {Object.entries(obj).map(([key, val], idx) => (
          <div key={`object-prop-${key}-${idx}`} className='flex flex-col'>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-1.5'>
                <TypeDot type={val.type} />
                <span className='text-sm font-medium text-slate-500'>
                  {key}:
                </span>
              </div>
              <div className='flex-1'>{renderValue(val, level, compact)}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
