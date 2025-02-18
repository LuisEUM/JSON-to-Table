"use client";

import * as React from "react";
import type { ReactElement } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { getTypeColor } from "../utils/colors";
import { ObjectCard } from "./object-card";
import type { ProcessedValue } from "../data-processor";

interface ArrayCellProps {
  items: ProcessedValue[];
}

const SimpleArrayDisplay = ({ items }: ArrayCellProps): ReactElement => {
  return (
    <div className='flex flex-wrap gap-1.5'>
      {items.map((item, index) => (
        <Badge
          key={`array-item-${index}`}
          variant='outline'
          className={`${getTypeColor(
            item.type
          )} text-xs font-mono whitespace-nowrap`}
        >
          {item.type === "string"
            ? `"${String(item.value)}"`
            : String(item.value)}
        </Badge>
      ))}
    </div>
  );
};

const ObjectArrayCarousel = ({ items }: ArrayCellProps): ReactElement => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState<number | null>(null);
  const [count, setCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!api) return;

    const initializeCarousel = () => {
      const totalSlides = api.scrollSnapList().length;
      setCount(totalSlides);
      setCurrent(api.selectedScrollSnap() + 1);
    };

    initializeCarousel();

    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap() + 1);
    };

    api.on("select", handleSelect);
    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  return (
    <div className='w-full relative'>
      <Carousel
        setApi={setApi}
        className='w-full'
        opts={{
          align: "start",
        }}
      >
        <CarouselContent>
          {items.map((item, index) => (
            <CarouselItem key={`carousel-item-${index}`}>
              <div className='p-1'>
                <ObjectCard value={item} compact />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className='flex items-center justify-between w-full absolute top-1/2 -translate-y-1/2 px-1'>
          <CarouselPrevious className='h-7 w-7 relative translate-y-0 left-4' />
          <CarouselNext className='h-7 w-7 relative translate-y-0 right-4' />
        </div>
        {current !== null && count !== null && (
          <div className='flex items-center gap-1 text-xs bg-white/80 px-2 py-1 rounded-md shadow-sm border absolute right-6 top-3'>
            <span>{current}</span>
            <span>/</span>
            <span>{count}</span>
          </div>
        )}
      </Carousel>
    </div>
  );
};

export function ArrayCell({ items }: ArrayCellProps): ReactElement {
  const containsObjects = items.some((item) => item.type === "objeto");

  if (containsObjects) {
    return <ObjectArrayCarousel items={items} />;
  }

  return <SimpleArrayDisplay items={items} />;
}
