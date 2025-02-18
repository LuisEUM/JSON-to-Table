"use client"

interface DateCellProps {
  value: string;
}

export function DateCell({ value }: DateCellProps) {
  return <span className="font-mono">{value}</span>;
} 