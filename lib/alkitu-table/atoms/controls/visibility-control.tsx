"use client";

import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/primitives/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/primitives/ui/tooltip";

interface VisibilityControlProps {
  isVisible?: boolean;
  disabled?: boolean;
  onToggle?: () => void;
  className?: string;
}

export const VisibilityControl = ({
  isVisible = true,
  disabled = false,
  onToggle,
  className
}: VisibilityControlProps) => {
  const tooltip = isVisible ? "Ocultar columna" : "Mostrar columna";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 w-6 p-0 ${
            disabled ? "opacity-50 cursor-not-allowed" : "text-muted-foreground"
          } ${className || ""}`}
          onClick={onToggle}
          disabled={disabled}
        >
          {isVisible ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};