"use client";

import { useState, useCallback } from "react";
import type { SortingState, ColumnFiltersState } from "@tanstack/react-table";

export interface TableState {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: Record<string, boolean>;
  globalFilter: string;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
}

export interface UseTableStateProps {
  initialState?: Partial<TableState>;
  onStateChange?: (state: TableState) => void;
}

export function useTableState({
  initialState = {},
  onStateChange
}: UseTableStateProps = {}) {
  const [state, setState] = useState<TableState>({
    sorting: [],
    columnFilters: [],
    columnVisibility: {},
    globalFilter: "",
    pagination: {
      pageIndex: 0,
      pageSize: 50,
    },
    ...initialState,
  });

  const updateState = useCallback((updates: Partial<TableState>) => {
    setState(prevState => {
      const newState = { ...prevState, ...updates };
      onStateChange?.(newState);
      return newState;
    });
  }, [onStateChange]);

  const setSorting = useCallback((sorting: SortingState) => {
    updateState({ sorting });
  }, [updateState]);

  const setColumnFilters = useCallback((columnFilters: ColumnFiltersState) => {
    updateState({ columnFilters });
  }, [updateState]);

  const setColumnVisibility = useCallback((columnVisibility: Record<string, boolean>) => {
    updateState({ columnVisibility });
  }, [updateState]);

  const setGlobalFilter = useCallback((globalFilter: string) => {
    updateState({ globalFilter });
  }, [updateState]);

  const setPagination = useCallback((pagination: { pageIndex: number; pageSize: number }) => {
    updateState({ pagination });
  }, [updateState]);

  const resetState = useCallback(() => {
    setState({
      sorting: [],
      columnFilters: [],
      columnVisibility: {},
      globalFilter: "",
      pagination: {
        pageIndex: 0,
        pageSize: 50,
      },
    });
  }, []);

  return {
    state,
    setSorting,
    setColumnFilters,
    setColumnVisibility,
    setGlobalFilter,
    setPagination,
    updateState,
    resetState,
  };
}