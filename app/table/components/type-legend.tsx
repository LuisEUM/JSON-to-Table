import { TypeDot } from "./type-dot"

const types = ["string", "número entero", "número decimal", "boolean", "fecha", "null", "undefined", "objeto", "array"]

export function TypeLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 px-2">
      {types.map((type) => (
        <div key={type} className="flex items-center gap-2">
          <TypeDot type={type} />
          <span className="text-sm text-slate-600 whitespace-nowrap">{type}</span>
        </div>
      ))}
    </div>
  )
}

