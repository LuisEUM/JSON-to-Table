"use client";

import type { ReactElement } from "react";
import { TypeDot } from "./type-dot";
import type { ProcessedValue } from "../data-processor";
import { formatDateString } from "../utils/date-formatter";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ObjectCardProps {
  value: ProcessedValue;
  compact?: boolean;
  showLabels?: boolean;
  level?: number;
}

const renderValue = (
  value: ProcessedValue,
  level = 0,
  compact = false
): ReactElement => {
  // Si el valor es nulo o indefinido
  if (!value || value.value === null || value.value === undefined) {
    return (
      <span className='text-sm italic text-muted-foreground'>
        {value?.value === null ? "null" : "undefined"}
      </span>
    );
  }

  // Para objetos anidados
  if (value.type === "objeto") {
    const nestedItems = Object.entries(
      value.value as Record<string, unknown>
    ).map(([key, val]) => ({
      type: typeof val === "object" ? "objeto" : typeof val,
      value: val,
      label: key,
      items:
        val && typeof val === "object" && !Array.isArray(val)
          ? Object.entries(val as Record<string, unknown>).map(([k, v]) => ({
              type: typeof v === "object" ? "objeto" : typeof v,
              value: v,
              label: k,
            }))
          : undefined,
    }));

    return (
      <div className='pl-4 border-l border-muted'>
        {nestedItems.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            className='flex items-center gap-2 w-full text-left py-0.5 hover:bg-muted/50 rounded px-1'
          >
            <div className='flex items-center gap-2 shrink-0'>
              <TypeDot type={item.type} />
              <span className='text-xs font-medium text-muted-foreground whitespace-nowrap'>
                {item.label}:
              </span>
            </div>
            <div className='flex-1 min-w-0'>
              {item.type === "objeto" ? (
                <ObjectCard
                  value={item}
                  showLabels
                  compact={compact}
                  level={(level || 0) + 1}
                />
              ) : (
                renderValue(item, level + 1, compact)
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Para arrays
  if (value.type === "array") {
    return (
      <div className='flex flex-col min-w-0 gap-1'>
        {value.items?.map((item, idx) => (
          <div
            key={`array-item-${idx}`}
            className='flex items-center gap-2 py-0.5 hover:bg-muted/50 rounded px-1'
          >
            <span className='text-xs text-muted-foreground w-6 text-right shrink-0'>
              {idx + 1}.
            </span>
            <div className='flex items-center gap-2 flex-1 min-w-0'>
              <TypeDot type={item.type} />
              <div className='flex-1 min-w-0 text-left'>
                {renderValue(item, level + 1, compact)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Para otros tipos primitivos (mantener el código existente)
  if (value.type === "fecha") {
    const formattedDate = formatDateString(
      value.value as string | number | Date
    );
    return (
      <span
        className='text-sm font-mono text-left whitespace-nowrap'
        title={formattedDate}
      >
        {formattedDate}
      </span>
    );
  }

  if (value.type === "número") {
    return (
      <span className='text-sm font-mono text-left whitespace-nowrap'>
        {Number(value.value).toLocaleString()}
      </span>
    );
  }

  if (value.type === "boolean") {
    return (
      <span className='text-sm font-mono'>
        {value.value ? "verdadero" : "falso"}
      </span>
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
  compact = false,
  showLabels = true,
  level = 0,
}: ObjectCardProps) {
  if (!value.items) return null;

  return (
    <div className={`flex flex-col gap-1 ${compact ? "py-1" : "py-2"}`}>
      {value.items.map((item, index) => (
        <div
          key={`${item.label}-${index}`}
          className='flex items-center gap-2 w-full text-left py-0.5 hover:bg-muted/50 rounded px-1'
        >
          {showLabels && (
            <div className='flex items-center gap-2 shrink-0'>
              <TypeDot type={item.type} />
              <span className='text-xs font-medium text-muted-foreground whitespace-nowrap'>
                {item.label}:
              </span>
            </div>
          )}
          <ScrollArea className='w-full' type='hover'>
            <div className='flex-1 min-w-0 text-left'>
              {renderValue(item, level, compact)}
            </div>
          </ScrollArea>
        </div>
      ))}
    </div>
  );
}
