import { AVAILABLE_TYPES, getTypeLabel } from "../../core/constants/type-styles";
import { TypeDot } from "../../atoms/indicators/TypeDot";

export function TypeLegend() {
  return (
    <div className='flex flex-wrap gap-2 mt-4'>
      {AVAILABLE_TYPES.map((type) => (
        <div
          key={type}
          className='flex items-center gap-1 text-xs text-muted-foreground'
        >
          <TypeDot type={type} />
          <span>{getTypeLabel(type)}</span>
        </div>
      ))}
    </div>
  );
}