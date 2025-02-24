import { TYPE_CONFIG } from "../types/value-types";
import { TypeDot } from "./type-dot";
import { TypeBadge } from "./type-badge";

interface TypeLegendProps {
  variant?: "dot" | "badge";
  className?: string;
}

export function TypeLegend({
  variant = "dot",
  className = "",
}: TypeLegendProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {Object.values(TYPE_CONFIG).map((typeConfig) => (
        <div key={typeConfig.id} className='flex items-center gap-2'>
          {variant === "dot" ? (
            <TypeDot type={typeConfig.id} />
          ) : (
            <TypeBadge type={typeConfig.id} />
          )}
          <span className='text-sm'>{typeConfig.label}</span>
        </div>
      ))}
    </div>
  );
}
