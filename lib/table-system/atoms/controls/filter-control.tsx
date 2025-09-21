"use client";

import React from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface FilterControlProps {
  isActive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  tooltip?: string;
}

export const FilterControl = ({
  isActive = false,
  disabled = false,
  onClick,
  className,
  tooltip = "Filtrar columna"
}: FilterControlProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 w-6 p-0 relative ${
            isActive
              ? "bg-primary text-primary-foreground rounded-0.5"
              : "text-muted-foreground"
          } ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          } ${className || ""}`}
          onClick={onClick}
          disabled={disabled}
        >
          <Filter className="h-4 w-4" />
          {isActive && (
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};