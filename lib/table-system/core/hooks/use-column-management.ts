"use client";

import { useState, useCallback, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ProcessedRow } from "../utils/data-processor";

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
  width?: number;
  pinned?: 'left' | 'right' | false;
}

export interface UseColumnManagementProps {
  columns: ColumnDef<ProcessedRow>[];
  initialVisibility?: Record<string, boolean>;
  onVisibilityChange?: (visibility: Record<string, boolean>) => void;
  storageKey?: string;
}

export function useColumnManagement({
  columns,
  initialVisibility = {},
  onVisibilityChange,
  storageKey
}: UseColumnManagementProps) {
  // Load from localStorage if storageKey is provided
  const loadFromStorage = useCallback(() => {
    if (!storageKey || typeof window === 'undefined') return initialVisibility;

    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : initialVisibility;
    } catch {
      return initialVisibility;
    }
  }, [storageKey, initialVisibility]);

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(loadFromStorage);
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columns.map(col => {
      if (typeof col.id === 'string') return col.id;
      if ('accessorKey' in col && typeof col.accessorKey === 'string') return col.accessorKey;
      return `col-${Math.random()}`;
    }).filter(Boolean)
  );

  // Save to localStorage when visibility changes
  const updateVisibility = useCallback((newVisibility: Record<string, boolean>) => {
    setColumnVisibility(newVisibility);
    onVisibilityChange?.(newVisibility);

    if (storageKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newVisibility));
      } catch (error) {
        console.warn('Failed to save column visibility to localStorage:', error);
      }
    }
  }, [onVisibilityChange, storageKey]);

  const toggleColumn = useCallback((columnId: string) => {
    setColumnVisibility((prev: Record<string, boolean>) => {
      const newVisibility = {
        ...prev,
        [columnId]: !prev[columnId]
      };
      onVisibilityChange?.(newVisibility);

      if (storageKey && typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, JSON.stringify(newVisibility));
        } catch (error) {
          console.warn('Failed to save column visibility to localStorage:', error);
        }
      }

      return newVisibility;
    });
  }, [onVisibilityChange, storageKey]);

  const showColumn = useCallback((columnId: string) => {
    setColumnVisibility((prev: Record<string, boolean>) => {
      const newVisibility = {
        ...prev,
        [columnId]: true
      };
      onVisibilityChange?.(newVisibility);

      if (storageKey && typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, JSON.stringify(newVisibility));
        } catch (error) {
          console.warn('Failed to save column visibility to localStorage:', error);
        }
      }

      return newVisibility;
    });
  }, [onVisibilityChange, storageKey]);

  const hideColumn = useCallback((columnId: string) => {
    setColumnVisibility((prev: Record<string, boolean>) => {
      const newVisibility = {
        ...prev,
        [columnId]: false
      };
      onVisibilityChange?.(newVisibility);

      if (storageKey && typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, JSON.stringify(newVisibility));
        } catch (error) {
          console.warn('Failed to save column visibility to localStorage:', error);
        }
      }

      return newVisibility;
    });
  }, [onVisibilityChange, storageKey]);

  const showAllColumns = useCallback(() => {
    const allVisible = columns.reduce((acc, col) => {
      const id = typeof col.id === 'string' ? col.id :
                 ('accessorKey' in col && typeof col.accessorKey === 'string') ? col.accessorKey : null;
      if (id) acc[id] = true;
      return acc;
    }, {} as Record<string, boolean>);
    updateVisibility(allVisible);
  }, [columns, updateVisibility]);

  const hideAllColumns = useCallback(() => {
    const allHidden = columns.reduce((acc, col) => {
      const id = typeof col.id === 'string' ? col.id :
                 ('accessorKey' in col && typeof col.accessorKey === 'string') ? col.accessorKey : null;
      if (id) acc[id] = false;
      return acc;
    }, {} as Record<string, boolean>);
    updateVisibility(allHidden);
  }, [columns, updateVisibility]);

  const reorderColumns = useCallback((newOrder: string[]) => {
    setColumnOrder(newOrder);
  }, []);

  const visibleColumns = useMemo(() => {
    return columns.filter(col => {
      const id = typeof col.id === 'string' ? col.id :
                 ('accessorKey' in col && typeof col.accessorKey === 'string') ? col.accessorKey : null;
      return id ? columnVisibility[id] !== false : true;
    });
  }, [columns, columnVisibility]);

  const hiddenColumns = useMemo(() => {
    return columns.filter(col => {
      const id = typeof col.id === 'string' ? col.id :
                 ('accessorKey' in col && typeof col.accessorKey === 'string') ? col.accessorKey : null;
      return id ? columnVisibility[id] === false : false;
    });
  }, [columns, columnVisibility]);

  const columnConfigs = useMemo((): ColumnConfig[] => {
    return columns.map((col, index) => {
      const id = typeof col.id === 'string' ? col.id :
                 ('accessorKey' in col && typeof col.accessorKey === 'string') ? col.accessorKey : null;
      return {
        id: id || `column-${index}`,
        label: col.header as string || id || `Column ${index + 1}`,
        visible: id ? columnVisibility[id] !== false : true,
        order: columnOrder.indexOf(id || '') !== -1 ? columnOrder.indexOf(id || '') : index,
      };
    });
  }, [columns, columnVisibility, columnOrder]);

  return {
    columnVisibility,
    columnOrder,
    visibleColumns,
    hiddenColumns,
    columnConfigs,
    toggleColumn,
    showColumn,
    hideColumn,
    showAllColumns,
    hideAllColumns,
    updateVisibility,
    reorderColumns,
  };
}