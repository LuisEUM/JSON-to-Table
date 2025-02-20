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

  const [operator, setOperator] = useState<FilterOperator>(
    initialValue?.operator || "greaterThan"
  );
  const [value, setValue] = useState<number>(
    Number(initialValue?.value) || minValue || 0
  );
  const [additionalValue, setAdditionalValue] = useState<number>(
    Number(initialValue?.additionalValue) || maxValue || 100
  );

  const minVal = minValue ?? 0;
  const maxVal = maxValue ?? 100;

  const handleApply = () => {
    onApply({
      field: columnId,
      operator,
      value,
      ...(["between", "notBetween"].includes(operator)
        ? { additionalValue }
        : {}),
    });
    onClose();
  };

  const needsAdditionalValue = ["between", "notBetween"].includes(operator);

  return (
    <div className='w-full h-full min-h-[350px] flex flex-col'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='font-medium'>
          Filtro para:{" "}
          <span
            className={`inline-block w-3 h-3 rounded-full ${
              getTypeColor(columnType).split(" ")[0]
            }`}
          ></span>{" "}
          {columnName}
        </h3>
      </div>

      <div className='space-y-4'>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Tipo de filtro</label>
          <Select
            value={operator}
            onValueChange={(value) => setOperator(value as FilterOperator)}
          >
            <SelectTrigger>
              <SelectValue />
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

        <div className='space-y-2'>
          {needsAdditionalValue ? (
            <>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Rango</label>
                <Slider
                  min={minVal}
                  max={maxVal}
                  step={(maxVal - minVal) / 100}
                  value={[value, additionalValue]}
                  onValueChange={([newValue, newAdditionalValue]) => {
                    setValue(newValue);
                    setAdditionalValue(newAdditionalValue);
                  }}
                />
                <div className='flex justify-between'>
                  <Input
                    type='number'
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className='w-24'
                  />
                  <Input
                    type='number'
                    value={additionalValue}
                    onChange={(e) => setAdditionalValue(Number(e.target.value))}
                    className='w-24'
                  />
                </div>
              </div>
            </>
          ) : (
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Valor</label>
              <Slider
                min={minVal}
                max={maxVal}
                step={(maxVal - minVal) / 100}
                value={[value]}
                onValueChange={([newValue]) => setValue(newValue)}
              />
              <Input
                type='number'
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className='w-full'
              />
            </div>
          )}
        </div>
      </div>

      <FilterFooter onClear={onClear} onClose={onClose} onApply={handleApply} />
    </div>
  );
}
