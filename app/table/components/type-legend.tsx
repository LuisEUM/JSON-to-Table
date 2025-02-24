import { TypeDot } from "./type-dot";
import { getTypeLabel } from "../utils/colors";

export function TypeLegend() {
  const types = [
    "string",
    "número",
    "boolean",
    "fecha",
    "array",
    "array[primitivo]",
    "array[objeto]",
    "objeto",
    "null",
    "undefined",
  ];

  return (
    <div className='flex flex-wrap gap-2 mt-4'>
      {types.map((type) => (
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
