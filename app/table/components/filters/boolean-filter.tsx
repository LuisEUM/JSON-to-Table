"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { FilterComponentProps } from "./filter-types";
import { FilterFooter } from "./filter-footer";
import { getTypeColor } from "../type-badge";

export function BooleanFilter({
  columnId,
  onApply,
  onClear,
  onClose,
  initialValue,
  columnName,
  columnType,
}: FilterComponentProps) {
  const [value, setValue] = useState<boolean | null>(() => {
    if (!initialValue) return null;
    const val = initialValue.value;
    if (typeof val === "boolean") return val;
    if (val === 1 || val === "1") return true;
    if (val === 0 || val === "0") return false;
    return null;
  });

  const handleSwitchChange = (newValue: boolean | null) => {
    setValue(newValue === value ? null : newValue);
  };

  const handleApply = () => {
    onApply({
      field: columnId,
      value: value,
      operator: "equals",
    });
    onClose();
  };

  return (
    <div className='w-full min-h-[350px] flex flex-col'>
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

      <div className='flex-grow space-y-6'>
        <div className='space-y-4 bg-muted/30 p-4 rounded-md'>
          <div className='flex items-center justify-between'>
            <Label htmlFor='true-value' className='flex-grow cursor-pointer'>
              Verdadero
            </Label>
            <Switch
              id='true-value'
              checked={value === true}
              onCheckedChange={() => handleSwitchChange(true)}
            />
          </div>
          <div className='flex items-center justify-between'>
            <Label htmlFor='false-value' className='flex-grow cursor-pointer'>
              Falso
            </Label>
            <Switch
              id='false-value'
              checked={value === false}
              onCheckedChange={() => handleSwitchChange(false)}
            />
          </div>
          <div className='flex items-center justify-between'>
            <Label htmlFor='null-value' className='flex-grow cursor-pointer'>
              Todos los valores
            </Label>
            <Switch
              id='null-value'
              checked={value === null}
              onCheckedChange={() => handleSwitchChange(null)}
            />
          </div>
        </div>

        <div className='text-sm text-muted-foreground'>
          Valor seleccionado:{" "}
          {value === null ? "Todos" : value ? "Verdadero (1)" : "Falso (0)"}
        </div>
      </div>

      <FilterFooter
        onClear={() => {
          setValue(null);
          onClear();
        }}
        onClose={onClose}
        onApply={handleApply}
      />
    </div>
  );
}
