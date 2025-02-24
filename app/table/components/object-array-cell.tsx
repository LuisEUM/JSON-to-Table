"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { getTypeColor } from "./type-badge";
import { ObjectCard } from "./object-card";
import type { ProcessedValue } from "../data-processor";
import { processValue } from "../data-processor";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ObjectArrayCellProps {
  value: ProcessedValue[];
}

interface ProcessedArrayItem extends ProcessedValue {
  title?: string;
  items?: ProcessedValue[];
}

export function ObjectArrayCell({ value }: ObjectArrayCellProps) {
  const typeColors = getTypeColor("array[objeto]");

  const processedItems = React.useMemo(() => {
    if (!Array.isArray(value)) return [];

    const allProperties = value.reduce((props, item) => {
      const itemValue = (item as ProcessedValue).value || item;
      if (typeof itemValue === "object" && itemValue !== null) {
        const itemProps = Object.keys(itemValue as Record<string, unknown>);
        itemProps.forEach((prop) => props.add(prop));
      }
      return props;
    }, new Set<string>());

    return value.map((item): ProcessedArrayItem => {
      const rawValue = (item as ProcessedValue).value || item;
      const itemValue = rawValue as Record<string, unknown>;

      const processedProperties = Object.entries(itemValue).map(
        ([key, val]) => ({
          id: key,
          ...processValue(val, key),
          label: key,
        })
      );

      let title = "Item";
      for (const prop of allProperties) {
        const propValue = itemValue[prop];
        if (propValue) {
          const propCount = value.filter((i) => {
            const iValue = ((i as ProcessedValue).value || i) as Record<
              string,
              unknown
            >;
            return iValue[prop] === propValue;
          }).length;

          if (propCount === 1) {
            title = `${prop}: ${String(propValue)}`;
            break;
          } else {
            title = `${String(propValue)} (${prop})`;
          }
        }
      }

      return {
        type: "objeto",
        value: itemValue,
        items: processedProperties,
        title,
      };
    });
  }, [value]);

  if (!Array.isArray(value)) return null;

  return (
    <Accordion type='multiple' className='w-full'>
      <AccordionItem value='items'>
        <AccordionTrigger className='hover:no-underline'>
          <Badge
            variant='outline'
            className={`${typeColors.bg} ${typeColors.text} ${typeColors.border}`}
          >
            {value.length} objetos
          </Badge>
        </AccordionTrigger>
        <AccordionContent>
          <ScrollArea className='h-[200px] w-full rounded-md border'>
            <div className='min-w-[max-content]'>
              {processedItems.map((item, index) => (
                <AccordionItem
                  key={`accordion-item-${index}`}
                  value={`item-${index}`}
                  className='border-b last:border-b-0 bg-background/50 py-0'
                >
                  <AccordionTrigger className='py-1.5 px-3 text-sm hover:no-underline'>
                    <div className='flex items-center gap-2 w-full'>
                      <span className='text-xs text-muted-foreground shrink-0'>
                        {index + 1}.
                      </span>
                      <span className='text-sm font-medium min-w-[max-content]'>
                        {item.title || "Item"}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className='px-3 py-1'>
                    <ObjectCard value={item} compact showLabels={true} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </div>
          </ScrollArea>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
