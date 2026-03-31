import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { getTypeStyle } from "../../core/constants/type-styles";

interface TypeDotProps {
  type: string;
}

export const TypeDot = React.memo(function TypeDot({ type }: TypeDotProps) {
  const { bg: colorClass } = getTypeStyle(type);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className={`w-3 h-3 rounded-full ${colorClass} cursor-help`} />
        </TooltipTrigger>
        <TooltipContent side='top'>
          <p className='text-sm font-medium'>{type}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
