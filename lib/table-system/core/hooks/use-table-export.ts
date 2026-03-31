"use client";

import { useCallback, useState } from "react";
import type { ProcessedRow } from "../utils/data-processor";

export type ExportFormat = 'json' | 'csv' | 'xlsx';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeHeaders?: boolean;
  selectedRowsOnly?: boolean;
  visibleColumnsOnly?: boolean;
}

export interface UseTableExportProps {
  data: ProcessedRow[];
  columns?: string[];
  onExportStart?: () => void;
  onExportEnd?: () => void;
  onExportError?: (error: Error) => void;
}

export function useTableExport({
  data,
  columns,
  onExportStart,
  onExportEnd,
  onExportError
}: UseTableExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToJSON = useCallback((exportData: ProcessedRow[], filename: string) => {
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const exportToCSV = useCallback((exportData: ProcessedRow[], filename: string, includeHeaders: boolean = true) => {
    if (exportData.length === 0) return;

    const headers = columns || Object.keys(exportData[0]);
    let csvContent = '';

    if (includeHeaders) {
      csvContent += headers.join(',') + '\n';
    }

    exportData.forEach(row => {
      const values = headers.map(header => {
        const value = row[header]?.value ?? '';
        // Escape quotes and wrap in quotes if contains comma or quote
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
      csvContent += values.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [columns]);

  const exportToXLSX = useCallback(async (exportData: ProcessedRow[], filename: string, includeHeaders: boolean = true) => {
    try {
      // Dynamic import for xlsx to reduce bundle size
      const XLSX = await import('xlsx');

      if (exportData.length === 0) return;

      const headers = columns || Object.keys(exportData[0]);
      const worksheetData = exportData.map(row => {
        const rowData: Record<string, unknown> = {};
        headers.forEach(header => {
          rowData[header] = row[header]?.value ?? '';
        });
        return rowData;
      });

      const worksheet = XLSX.utils.json_to_sheet(worksheetData, {
        header: headers,
        skipHeader: !includeHeaders
      });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } catch (error) {
      throw new Error(`Failed to export XLSX: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [columns]);

  const exportData = useCallback(async (options: ExportOptions, selectedRows?: ProcessedRow[]) => {
    setIsExporting(true);
    onExportStart?.();

    try {
      const exportData = options.selectedRowsOnly && selectedRows ? selectedRows : data;

      if (exportData.length === 0) {
        throw new Error('No data to export');
      }

      const filename = options.filename || `table-export-${new Date().toISOString().split('T')[0]}`;

      switch (options.format) {
        case 'json':
          exportToJSON(exportData, filename);
          break;
        case 'csv':
          exportToCSV(exportData, filename, options.includeHeaders);
          break;
        case 'xlsx':
          await exportToXLSX(exportData, filename, options.includeHeaders);
          break;
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }

      onExportEnd?.();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      onExportError?.(errorObj);
    } finally {
      setIsExporting(false);
    }
  }, [data, exportToJSON, exportToCSV, exportToXLSX, onExportStart, onExportEnd, onExportError]);

  const exportAsJSON = useCallback((filename?: string, selectedRows?: ProcessedRow[]) => {
    return exportData({
      format: 'json',
      filename,
      selectedRowsOnly: !!selectedRows
    }, selectedRows);
  }, [exportData]);

  const exportAsCSV = useCallback((filename?: string, includeHeaders = true, selectedRows?: ProcessedRow[]) => {
    return exportData({
      format: 'csv',
      filename,
      includeHeaders,
      selectedRowsOnly: !!selectedRows
    }, selectedRows);
  }, [exportData]);

  const exportAsXLSX = useCallback((filename?: string, includeHeaders = true, selectedRows?: ProcessedRow[]) => {
    return exportData({
      format: 'xlsx',
      filename,
      includeHeaders,
      selectedRowsOnly: !!selectedRows
    }, selectedRows);
  }, [exportData]);

  return {
    isExporting,
    exportData,
    exportAsJSON,
    exportAsCSV,
    exportAsXLSX,
  };
}