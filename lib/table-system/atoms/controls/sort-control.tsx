"use client";

import React from "react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type SortDirection = "asc" | "desc" | false;
export type SortType = "text" | "numeric" | "datetime" | "none";

interface SortControlProps {
  direction: SortDirection;
  sortType: SortType;
  disabled?: boolean;
  onSort: (direction: SortDirection) => void;
  className?: string;
}

const getSortTooltip = (direction: SortDirection, sortType: SortType) => {
  if (sortType === "none") return "No se puede ordenar este tipo de dato";

  if (!direction) {
    return `Ordenar ${
      sortType === "datetime" ? "por fecha" :
      sortType === "numeric" ? "numéricamente" :
      "alfabéticamente"
    }`;
  }

  if (direction === "asc") {
    return `Ordenado ${
      sortType === "datetime" ? "de más antiguo a más reciente" :
      sortType === "numeric" ? "de menor a mayor" :
      "de A a Z"
    } - Click para invertir`;
  }

  return `Ordenado ${
    sortType === "datetime" ? "de más reciente a más antiguo" :
    sortType === "numeric" ? "de mayor a menor" :
    "de Z a A"
  } - Click para quitar ordenamiento`;
};

export const SortControl = ({
  direction,
  sortType,
  disabled = false,
  onSort,
  className
}: SortControlProps) => {
  const handleClick = () => {
    if (disabled) return;

    // Three-state cycle: none → asc → desc → none
    if (!direction) {
      onSort("asc");
    } else if (direction === "asc") {
      onSort("desc");
    } else {
      onSort(false);
    }
  };

  const icon = !direction
    ? <ArrowUpDown className="h-4 w-4" />
    : direction === "asc"
    ? <ArrowUp className="h-4 w-4" />
    : <ArrowDown className="h-4 w-4" />;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 w-6 p-0 ${
            direction ? "text-primary" : "text-muted-foreground"
          } ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          } ${className || ""}`}
          onClick={handleClick}
          disabled={disabled}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>{getSortTooltip(direction, sortType)}</p>
      </TooltipContent>
    </Tooltip>
  );
};