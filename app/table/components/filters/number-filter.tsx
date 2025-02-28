import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FilterComponentProps } from "./filter-types";
import { FilterFooter } from "./filter-footer";
import { getTypeStyle } from "../type-indicators";
import { DialogTitle } from "@/components/ui/dialog";
import { Search } from "lucide-react";

const PRESETS = [
  { label: "Personalizado", value: "custom" },
  { label: "Valores positivos", value: "positive" },
  { label: "Valores negativos", value: "negative" },
  { label: "Valores mayores a la media", value: "aboveAverage" },
  { label: "Valores menores a la media", value: "belowAverage" },
  { label: "Top 25%", value: "top25" },
  { label: "Último 25%", value: "bottom25" },
];

interface NumberOption {
  value: number;
  label: string;
  checked: boolean;
  count: number;
}

interface NumberRange {
  start?: number;
  end?: number;
}

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
  const [selectedPreset, setSelectedPreset] = useState("custom");
  const [isInverted, setIsInverted] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Calcular estadísticas básicas
  const numbers = uniqueValues
    .map((v) => Number(v.value))
    .filter((n) => !isNaN(n));
  const calculatedMin = minValue ?? Math.min(...numbers);
  const calculatedMax = maxValue ?? Math.max(...numbers);
  const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const sorted = [...numbers].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];

  const [numberRange, setNumberRange] = useState<NumberRange>(() => {
    if (!initialValue?.value || !Array.isArray(initialValue.value)) {
      return { start: calculatedMin, end: calculatedMax };
    }
    const values = initialValue.value.map((v) => Number(v));
    return {
      start: Math.min(...values),
      end: Math.max(...values),
    };
  });

  const [numberOptions, setNumberOptions] = useState<NumberOption[]>([]);
  const [selectedNumbers, setSelectedNumbers] = useState<Set<string>>(() => {
    if (!initialValue?.value || !Array.isArray(initialValue.value)) {
      return new Set<string>();
    }
    return new Set(initialValue.value.map(String));
  });

  // Generar opciones de números
  useEffect(() => {
    const numberCounts = new Map<string, number>();
    uniqueValues.forEach((option) => {
      const num = Number(option.value);
      if (!isNaN(num)) {
        const numStr = num.toString();
        numberCounts.set(
          numStr,
          (numberCounts.get(numStr) || 0) + option.count
        );
      }
    });

    const options: NumberOption[] = Array.from(numberCounts.entries())
      .map(([numStr, count]) => ({
        value: Number(numStr),
        label: numStr,
        checked: false,
        count,
      }))
      .sort((a, b) => a.value - b.value);

    setNumberOptions(options);
  }, [uniqueValues]);

  const getPresetRange = (preset: string): NumberRange => {
    switch (preset) {
      case "positive":
        return { start: 0, end: calculatedMax };
      case "negative":
        return { start: calculatedMin, end: 0 };
      case "aboveAverage":
        return { start: avg, end: calculatedMax };
      case "belowAverage":
        return { start: calculatedMin, end: avg };
      case "top25":
        return { start: q3, end: calculatedMax };
      case "bottom25":
        return { start: calculatedMin, end: q1 };
      default:
        return { start: undefined, end: undefined };
    }
  };

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    if (preset === "custom") return;

    const newRange = getPresetRange(preset);
    setNumberRange(newRange);

    if (newRange.start !== undefined || newRange.end !== undefined) {
      const newSelected = new Set<string>();
      numberOptions.forEach((option) => {
        const isInRange = (() => {
          if (!newRange.start && !newRange.end) return true;
          if (newRange.start && !newRange.end)
            return option.value >= newRange.start;
          if (!newRange.start && newRange.end)
            return option.value <= newRange.end;
          return newRange.start && newRange.end
            ? option.value >= newRange.start && option.value <= newRange.end
            : true;
        })();

        if (isInverted ? isInRange : !isInRange) {
          newSelected.add(option.label);
        }
      });

      setSelectedNumbers(newSelected);
    }
  };

  const handleNumberInputChange = (type: "start" | "end", value: string) => {
    const num = value ? Number(value) : undefined;

    // Validar que el número esté dentro de los límites permitidos
    if (num !== undefined) {
      if (type === "start" && num < calculatedMin) return;
      if (type === "end" && num > calculatedMax) return;
    }

    setNumberRange((prev) => {
      const newRange = { ...prev, [type]: num };

      const newSelected = new Set<string>();
      numberOptions.forEach((option) => {
        const isInRange = (() => {
          if (!newRange.start && !newRange.end) return true;
          if (newRange.start && !newRange.end)
            return option.value >= newRange.start;
          if (!newRange.start && newRange.end)
            return option.value <= newRange.end;
          return newRange.start && newRange.end
            ? option.value >= newRange.start && option.value <= newRange.end
            : true;
        })();

        if (isInverted ? isInRange : !isInRange) {
          newSelected.add(option.label);
        }
      });

      setSelectedNumbers(newSelected);
      return newRange;
    });
  };

  const handleCheckboxChange = (numStr: string, checked: boolean) => {
    const newSelected = new Set(selectedNumbers);
    if (checked) {
      newSelected.add(numStr);
    } else {
      newSelected.delete(numStr);
    }
    setSelectedNumbers(newSelected);
  };

  // Mantener sincronizadas las selecciones cuando cambia el modo
  useEffect(() => {
    if (numberOptions.length === 0) return;

    const newSelected = new Set<string>();
    numberOptions.forEach((option) => {
      const isInRange = (() => {
        if (!numberRange.start && !numberRange.end) return true;
        if (numberRange.start && !numberRange.end)
          return option.value >= numberRange.start;
        if (!numberRange.start && numberRange.end)
          return option.value <= numberRange.end;
        return numberRange.start && numberRange.end
          ? option.value >= numberRange.start && option.value <= numberRange.end
          : true;
      })();

      if (isInverted ? isInRange : !isInRange) {
        newSelected.add(option.label);
      }
    });

    setSelectedNumbers(newSelected);
  }, [isInverted, numberOptions, numberRange.start, numberRange.end]);

  const handleApply = () => {
    if (selectedNumbers.size === 0) {
      onClear();
      onClose();
      return;
    }

    onApply({
      field: columnId,
      operator: "arrIncludesSome",
      value: Array.from(selectedNumbers),
    });
    onClose();
  };

  return (
    <div className='w-full h-full min-h-[350px] flex flex-col'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='font-medium'>
          Filtro para:{" "}
          <span
            className={`inline-block w-3 h-3 rounded-full ${
              getTypeStyle(columnType).bg
            }`}
          ></span>{" "}
          {columnName}
        </h3>
      </div>

      <div className='space-y-4 flex-1'>
        <Select value={selectedPreset} onValueChange={handlePresetChange}>
          <SelectTrigger>
            <SelectValue placeholder='Selecciona un rango predefinido' />
          </SelectTrigger>
          <SelectContent>
            <DialogTitle className='sr-only'>
              Seleccionar rango predefinido
            </DialogTitle>
            {PRESETS.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className='flex items-center justify-between space-x-2'>
          <Label htmlFor='range-mode' className='text-sm'>
            {isInverted ? "Dentro del rango" : "Fuera del rango"}
          </Label>
          <Switch
            id='range-mode'
            checked={isInverted}
            onCheckedChange={setIsInverted}
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label>Desde</Label>
            <Input
              type='number'
              value={numberRange.start ?? ""}
              onChange={(e) => {
                setSelectedPreset("custom");
                handleNumberInputChange("start", e.target.value);
              }}
              min={calculatedMin}
              max={calculatedMax}
              step='any'
              placeholder={calculatedMin.toString()}
            />
          </div>
          <div className='space-y-2'>
            <Label>Hasta</Label>
            <Input
              type='number'
              value={numberRange.end ?? ""}
              onChange={(e) => {
                setSelectedPreset("custom");
                handleNumberInputChange("end", e.target.value);
              }}
              min={calculatedMin}
              max={calculatedMax}
              step='any'
              placeholder={calculatedMax.toString()}
            />
          </div>
        </div>

        {numberOptions.length > 0 && (
          <>
            <div className='text-sm text-muted-foreground'>
              {selectedNumbers.size} valores seleccionados en el rango
            </div>

            <Accordion type='single' collapsible className='w-full'>
              <AccordionItem value='number-breakdown'>
                <AccordionTrigger className='text-sm'>
                  Ver desglose por valores
                </AccordionTrigger>
                <AccordionContent>
                  <div className='space-y-2'>
                    <div className='relative'>
                      <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                      <Input
                        placeholder='Buscar valores...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='pl-8 mb-2'
                      />
                    </div>
                    <ScrollArea className='w-full rounded-md border'>
                      <div className='p-4 space-y-2 h-[200px]'>
                        {numberOptions
                          .filter(
                            (option) =>
                              !searchTerm ||
                              option.label
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())
                          )
                          .map((option) => (
                            <div
                              key={option.label}
                              className='flex items-center justify-between'
                            >
                              <div className='flex items-center space-x-2'>
                                <Checkbox
                                  id={option.label}
                                  checked={selectedNumbers.has(option.label)}
                                  onCheckedChange={(checked) =>
                                    handleCheckboxChange(
                                      option.label,
                                      checked as boolean
                                    )
                                  }
                                />
                                <Label htmlFor={option.label}>
                                  {option.label}
                                </Label>
                              </div>
                              <span className='text-sm text-muted-foreground'>
                                {option.count}
                              </span>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}

        {numberOptions.length === 0 && (
          <div className='flex-1 flex items-center justify-center text-muted-foreground text-sm'>
            No hay valores numéricos disponibles
          </div>
        )}
      </div>

      <FilterFooter onClear={onClear} onClose={onClose} onApply={handleApply} />
    </div>
  );
}
