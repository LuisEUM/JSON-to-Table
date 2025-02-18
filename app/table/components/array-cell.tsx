import { Badge } from "@/components/ui/badge"
import { getTypeColor } from "../utils/colors"

interface ArrayCellProps {
  items: Array<{
    value: any
    type: string
  }>
}

export function ArrayCell({ items }: ArrayCellProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item, index) => (
        <Badge key={index} variant="outline" className={getTypeColor(item.type)}>
          {String(item.value)}
        </Badge>
      ))}
    </div>
  )
}

