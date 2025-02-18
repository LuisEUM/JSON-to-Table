import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getTypeColor } from "../utils/colors"

interface TypeDotProps {
  type: string
}

export function TypeDot({ type }: TypeDotProps) {
  const colorClass = getTypeColor(type)

  return (
    <Popover>
      <PopoverTrigger>
        <div className={`w-3 h-3 rounded-full ${colorClass} cursor-help`} />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <p className="text-sm font-medium">{type}</p>
      </PopoverContent>
    </Popover>
  )
}

