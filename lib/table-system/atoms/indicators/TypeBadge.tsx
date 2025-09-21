import { Badge } from "@/components/ui/badge";
import { getTypeLabel, getTypeStyle } from "../../core/constants/type-styles";

interface TypeBadgeProps {
  type: string;
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const style = getTypeStyle(type);
  return (
    <Badge
      variant='outline'
      className={`${style.bg} ${style.text} font-medium px-2 py-0.5 rounded-md transition-all hover:shadow-md`}
    >
      {getTypeLabel(type)}
    </Badge>
  );
}
