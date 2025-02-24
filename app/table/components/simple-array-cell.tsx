"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { getTypeColor } from "./type-badge";
import type { ProcessedValue } from "../data-processor";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SimpleArrayCellProps {
  value: ProcessedValue[];
}

export function SimpleArrayCell({ value }: SimpleArrayCellProps) {
  if (!Array.isArray(value)) return null;

  const typeColors = getTypeColor("array[primitivo]");
  const itemType = value[0]?.type || "unknown";
  const itemColors = getTypeColor(itemType);

  return (
    <Accordion type='single' collapsible className='w-full'>
      <AccordionItem value='items'>
        <AccordionTrigger className='hover:no-underline'>
          <Badge
            variant='outline'
            className={`${typeColors.bg} ${typeColors.text} ${typeColors.border}`}
          >
            {value.length} valores
          </Badge>
        </AccordionTrigger>
        <AccordionContent>
          <ScrollArea className='h-[200px] w-full rounded-md border p-2'>
            <div className='flex flex-wrap gap-2'>
              {value.map((item, index) => (
                <Badge
                  key={`item-${index}`}
                  variant='outline'
                  className={`${itemColors.bg} ${itemColors.text} ${itemColors.border}`}
                >
                  {String(item.value)}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
