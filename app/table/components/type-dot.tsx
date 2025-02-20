import type React from "react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { getTypeColor } from "./type-badge"

interface TypeDotProps {
  type: string
}

export function TypeDot({ type }: TypeDotProps) {
  const colorClass = getTypeColor(type).split(" ")[0]

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className={`w-3 h-3 rounded-full ${colorClass} cursor-help`} />
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-sm font-medium">{type}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default function TypeDotProvider({ children }: { children: React.ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>
}

