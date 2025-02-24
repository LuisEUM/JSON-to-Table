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
  console.log("BooleanFilter - Columna:", columnName);
  console.log("BooleanFilter - Tipo:", columnType);

  const [value, setValue] = useState<boolean | null>(
    initialValue?.value === true || initialValue?.value === false
      ? initialValue.value
      : null
  );

  const handleApply = () => {
    if (value === null) {
      onClear();
    } else {
      onApply({
        field: columnId,
        operator: "equals",
        value: value,
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
        <div className="flex items-center space-x-2">
          <Switch
            id="true-value"
            checked={value === true}
            onCheckedChange={() => setValue(true)}
          />
          <Label htmlFor="true-value">Verdadero</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="false-value"
            checked={value === false}
            onCheckedChange={() => setValue(false)}
          />
          <Label htmlFor="false-value">Falso</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="null-value"
            checked={value === null}
            onCheckedChange={() => setValue(null)}
          />
          <Label htmlFor="null-value">Todos</Label>
        </div>
      </div>

      <div className="flex-1" />

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
