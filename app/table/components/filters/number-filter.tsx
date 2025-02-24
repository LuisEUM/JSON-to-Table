import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FilterComponentProps, FilterOperator } from "./filter-types";
import { FilterFooter } from "./filter-footer";
import { getTypeColor } from "../type-badge";
import { Slider } from "@/components/ui/slider";

const OPERATORS: { label: string; value: FilterOperator }[] = [
  { label: "Mayor que", value: "greaterThan" },
  { label: "Menor que", value: "lessThan" },
  { label: "Entre", value: "between" },
  { label: "Fuera de rango", value: "notBetween" },
  { label: "Igual a", value: "equals" },
];

export function NumberFilter({
  columnId,
  onApply,
  onClear,
  onClose,
  initialValue,
  columnName,
  columnType,
  uniqueValues,
  minValue,
  maxValue,
}: FilterComponentProps & { minValue?: number; maxValue?: number }) {
  console.log("NumberFilter - Columna:", columnName);
  console.log("NumberFilter - Tipo:", columnType);
  console.log("NumberFilter - Valores únicos:", uniqueValues);
  console.log("NumberFilter - Valor mínimo:", minValue);
  console.log("NumberFilter - Valor máximo:", maxValue);

  // Calcular min y max a partir de uniqueValues si no se proporcionan
  const calculatedMin =
    minValue ?? Math.min(...uniqueValues.map((opt) => Number(opt.value)));
  const calculatedMax =
    maxValue ?? Math.max(...uniqueValues.map((opt) => Number(opt.value)));

  const [operator, setOperator] = useState<FilterOperator>(
    initialValue?.operator || "equals"
  );

  const [value, setValue] = useState<number>(
    Number(initialValue?.value) || calculatedMin
  );

  const [additionalValue, setAdditionalValue] = useState<number>(
    Number(initialValue?.additionalValue) || calculatedMax
  );

  const minVal = calculatedMin;
  const maxVal = calculatedMax;
  const step = (maxVal - minVal) / 100;

  const needsAdditionalValue = ["between", "notBetween"].includes(operator);

  const handleApply = () => {
    if (operator === "between" || operator === "notBetween") {
      onApply({
        field: columnId,
        operator,
        value: Math.min(value, additionalValue),
        additionalValue: Math.max(value, additionalValue),
      });
    } else {
      onApply({
        field: columnId,
        operator,
        value: Number(value),
      });
    }
    onClose();
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">
          Filtro para:{" "}
          <span
            className={`inline-block w-3 h-3 rounded-full ${
              getTypeColor(columnType).split(" ")[0]
            }`}
          ></span>{" "}
          {columnName}
        </h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Operador</label>
          <Select
            value={operator}
            onValueChange={(value: FilterOperator) => setOperator(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar operador" />
            </SelectTrigger>
            <SelectContent>
              {OPERATORS.map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {needsAdditionalValue ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rango</label>
              <div className="pt-4">
                <Slider
                  min={minVal}
                  max={maxVal}
                  step={step}
                  value={[value, additionalValue]}
                  onValueChange={([newValue, newAdditionalValue]) => {
                    setValue(newValue);
                    setAdditionalValue(newAdditionalValue);
                  }}
                />
              </div>
              <div className="flex justify-between gap-4 mt-2">
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => {
                    const newValue = Number(e.target.value);
                    setValue(Math.max(minVal, Math.min(maxVal, newValue)));
                  }}
                  className="w-24"
                />
                <Input
                  type="number"
                  value={additionalValue}
                  onChange={(e) => {
                    const newValue = Number(e.target.value);
                    setAdditionalValue(
                      Math.max(minVal, Math.min(maxVal, newValue))
                    );
                  }}
                  className="w-24"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium">Valor</label>
            <div className="pt-4">
              <Slider
                min={minVal}
                max={maxVal}
                step={step}
                value={[value]}
                onValueChange={([newValue]) => setValue(newValue)}
              />
            </div>
            <Input
              type="number"
              value={value}
              onChange={(e) => {
                const newValue = Number(e.target.value);
                setValue(Math.max(minVal, Math.min(maxVal, newValue)));
              }}
              className="w-full mt-2"
            />
          </div>
        )}
      </div>

      <FilterFooter onClear={onClear} onClose={onClose} onApply={handleApply} />
    </div>
  );
}
