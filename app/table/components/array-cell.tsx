"use client";

import * as React from "react";
import type { ReactElement } from "react";
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

function isProcessedValue(value: unknown): value is ProcessedValue {
  return typeof value === "object" && value !== null && "type" in value;
}

interface ArrayCellProps {
  items: ProcessedValue[];
}

const SimpleArrayDisplay = ({ items }: ArrayCellProps): ReactElement => {
  return (
    <ScrollArea className="w-full" type="hover">
      <div className="flex flex-wrap gap-2 p-2">
        {items.map((item, index) => {
          const typeConfig = getTypeColor(item.type || "unknown");
          return (
            <Badge
              key={index}
              variant="outline"
              className={`${typeConfig.bg} ${typeConfig.text} ${typeConfig.border}`}
            >
              {String(item.value)}
            </Badge>
          );
        })}
      </div>
    </ScrollArea>
  );
};

const ObjectArrayAccordion = ({ items }: ArrayCellProps): ReactElement => {
  const processedItems = React.useMemo(() => {
    // Obtener todas las propiedades únicas
    const allProperties = items.reduce((props, item) => {
      if (isProcessedValue(item) && item.type === "objeto") {
        const itemProps = Object.keys(item.value as Record<string, unknown>);
        itemProps.forEach((prop) => props.add(prop));
      }
      return props;
    }, new Set<string>());

    return items.map((item, index) => {
      if (isProcessedValue(item) && item.type === "objeto") {
        const processedProperties = Object.entries(
          item.value as Record<string, unknown>
        ).map(([key, val]) => ({
          id: key,
          path: [key],
          ...processValue(val, key),
          label: key,
        }));

        // Encontrar una propiedad única para el título
        let title = "Item";
        for (const prop of allProperties) {
          const propValue = (item.value as Record<string, unknown>)[prop];
          if (propValue) {
            // Si la propiedad es única, usar solo el nombre de la propiedad
            const propCount = items.filter(
              (i) =>
                i.type === "objeto" &&
                (i.value as Record<string, unknown>)[prop] === propValue
            ).length;

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
          value: item.value,
          items: processedProperties,
          id: `item-${index}`,
          path: item.path || [`item-${index}`],
          title,
        };
      }
      return item;
    });
  }, [items]);

  return (
    <ScrollArea className='h-[200px] w-full rounded-md border'>
      <div className='min-w-[max-content]'>
        <Accordion type='multiple' className='w-full'>
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
                <ScrollArea className='w-full' type='hover'>
                  <div className='min-w-[max-content]'>
                    <ObjectCard value={item} compact showLabels={true} />
                  </div>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </ScrollArea>
  );
};

export function ArrayCell({ items }: ArrayCellProps): ReactElement {
  const containsObjects = items.some(
    (item) =>
      item.type === "objeto" || (item.value && typeof item.value === "object")
  );

  if (!containsObjects) {
    return <SimpleArrayDisplay items={items} />;
  }

  return <ObjectArrayAccordion items={items} />;
}
