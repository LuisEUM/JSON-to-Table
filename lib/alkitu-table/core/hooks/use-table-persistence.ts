import { useCallback } from "react";
import type {
  SortingState,
  VisibilityState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { logger } from "../services/logging-service";

interface UseTablePersistenceOptions {
  isSecondaryTable: boolean;
  parentTableInfo?: { id: string; name: string };
}

interface TableConfig {
  columnOrder?: string[];
  columnVisibility?: Record<string, boolean>;
  useFixedColumn?: boolean;
  fixedColumnId?: string | null;
  sorting?: unknown[];
  columnFilters?: unknown[];
  globalFilter?: string;
  timestamp?: number;
}

export function useTablePersistence(options: UseTablePersistenceOptions) {
  const { isSecondaryTable, parentTableInfo } = options;

  const getStorageKey = useCallback(
    (suffix: string) => {
      const baseKey = isSecondaryTable
        ? `table-config-${parentTableInfo?.name || "secondary"}-${suffix}`
        : `table-config-main-${suffix}`;
      return baseKey;
    },
    [isSecondaryTable, parentTableInfo?.name]
  );

  const saveColumnConfiguration = useCallback(
    (state: {
      columnOrder: string[];
      columnVisibility: VisibilityState;
      useFixedColumn: boolean;
      fixedColumnId: string | null;
      sorting: SortingState;
      columnFilters: ColumnFiltersState;
      globalFilter: string;
    }) => {
      const config: TableConfig = {
        ...state,
        timestamp: Date.now(),
      };
      localStorage.setItem(getStorageKey("current"), JSON.stringify(config));
    },
    [getStorageKey]
  );

  const loadColumnConfiguration = useCallback((): TableConfig | null => {
    try {
      const saved = localStorage.getItem(getStorageKey("current"));
      if (saved) {
        const config = JSON.parse(saved) as TableConfig;
        return config;
      }
    } catch (error) {
      logger.error("Error loading column configuration:", error);
    }
    return null;
  }, [getStorageKey]);

  const saveAsDefaultConfiguration = useCallback(
    (state: {
      columnOrder: string[];
      columnVisibility: VisibilityState;
      useFixedColumn: boolean;
      fixedColumnId: string | null;
    }) => {
      const config: TableConfig = {
        ...state,
        timestamp: Date.now(),
      };
      localStorage.setItem(getStorageKey("default"), JSON.stringify(config));
      toast.success("Configuración guardada como predeterminada");
    },
    [getStorageKey]
  );

  const loadDefaultConfiguration = useCallback((): TableConfig | null => {
    try {
      const saved = localStorage.getItem(getStorageKey("default"));
      if (saved) {
        const config = JSON.parse(saved) as TableConfig;
        return config;
      }
    } catch (error) {
      logger.error("Error loading default configuration:", error);
    }
    return null;
  }, [getStorageKey]);

  return {
    getStorageKey,
    saveColumnConfiguration,
    loadColumnConfiguration,
    saveAsDefaultConfiguration,
    loadDefaultConfiguration,
  };
}

export type { UseTablePersistenceOptions, TableConfig };
