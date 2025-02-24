import { Badge } from "@/components/ui/badge";
import { TYPE_CONFIG, type ValueType } from "../types/value-types";

interface TypeBadgeProps {
  type: string;
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const typeConfig = TYPE_CONFIG[type as ValueType] || TYPE_CONFIG.undefined;
  const { color, label } = typeConfig;

  return (
    <Badge
      variant='outline'
      className={`${color.bg} ${color.text} ${color.border} font-medium px-2 py-0.5 rounded-md transition-all hover:shadow-md`}
    >
      {label}
    </Badge>
  );
}

// Exportar helper para otros componentes
export const getTypeColor = (type: string) => {
  const typeConfig = TYPE_CONFIG[type as ValueType] || TYPE_CONFIG.undefined;
  return typeConfig.color;
};
