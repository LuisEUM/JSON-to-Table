import { Badge } from "@/components/ui/badge";
import { getTypeLabel } from "../utils/colors";

export const getTypeColor = (type: string): string => {
  const colors: {
    [key: string]: { bg: string; text: string; border: string };
  } = {
    string: {
      bg: "bg-green-200",
      text: "text-green-700",
      border: "border-green-200",
    },
    "número": {
      bg: "bg-blue-200",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    boolean: {
      bg: "bg-purple-200",
      text: "text-purple-700",
      border: "border-purple-200",
    },
    fecha: {
      bg: "bg-pink-200",
      text: "text-pink-700",
      border: "border-pink-200",
    },
    null: { bg: "bg-red-200", text: "text-red-700", border: "border-red-200" },
    undefined: {
      bg: "bg-gray-200",
      text: "text-gray-700",
      border: "border-gray-200",
    },
    objeto: {
      bg: "bg-yellow-200",
      text: "text-yellow-700",
      border: "border-yellow-200",
    },
    array: {
      bg: "bg-orange-200",
      text: "text-orange-700",
      border: "border-orange-200",
    },
  };
  const style = colors[type] || {
    bg: "bg-gray-200",
    text: "text-gray-700",
    border: "border-gray-200",
  };
  return `${style.bg} ${style.text} ${style.border} border shadow-sm`;
};

interface TypeBadgeProps {
  type: string;
}

export function TypeBadge({ type }: TypeBadgeProps) {
  return (
    <Badge
      variant='outline'
      className={`${getTypeColor(
        type
      )} font-medium px-2 py-0.5 rounded-md transition-all hover:shadow-md`}
    >
      {getTypeLabel(type)}
    </Badge>
  );
}
