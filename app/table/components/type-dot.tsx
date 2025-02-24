import type React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { TYPE_CONFIG, type ValueType } from "../types/value-types";

interface TypeDotProps {
  type: string;
}

export function TypeDot({ type }: TypeDotProps) {
  const typeConfig = TYPE_CONFIG[type as ValueType] || TYPE_CONFIG.undefined;
  const { color, label } = typeConfig;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div
            className={`w-2 h-2 rounded-full ${color.dot}`}
            aria-label={label}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function TypeDotProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TooltipProvider>{children}</TooltipProvider>;
}
