"use client";

import { useMemo } from "react";

export type FilterTabType = "todos" | "activos" | "inactivos";

export interface FilterTabCounts {
  todos: number;
  activos: number;
  inactivos: number;
}

export interface FilterTabsResult<T> {
  filteredItems: {
    todos: T[];
    activos: T[];
    inactivos: T[];
  };
  counts: FilterTabCounts;
}

/**
 * Hook para manejar el filtrado de elementos por tabs (todos, activos, inactivos)
 * Separa elementos en activos (seleccionados) e inactivos (no seleccionados)
 */
export function useFilterTabs<T>(
  items: T[],
  selectedItems: T[],
  compareFunction?: (item: T, selected: T) => boolean
): FilterTabsResult<T> {
  const defaultCompare = (item: T, selected: T) => item === selected;
  const compare = compareFunction || defaultCompare;

  const result = useMemo(() => {
    const isSelected = (item: T) =>
      selectedItems.some((selected) => compare(item, selected));

    const activos = items.filter(isSelected);
    const inactivos = items.filter(item => !isSelected(item));

    return {
      filteredItems: {
        todos: items,
        activos,
        inactivos,
      },
      counts: {
        todos: items.length,
        activos: activos.length,
        inactivos: inactivos.length,
      },
    };
  }, [items, selectedItems, compare]);

  return result;
}

/**
 * Hook para manejar el estado de tabs de filtros con búsqueda
 */
export function useFilterTabsWithSearch<T>(
  items: T[],
  selectedItems: T[],
  searchTerm: string,
  searchFunction: (item: T, searchTerm: string) => boolean,
  compareFunction?: (item: T, selected: T) => boolean
): FilterTabsResult<T> {
  const filteredBySearch = useMemo(() => {
    if (!searchTerm.trim()) return items;
    return items.filter(item => searchFunction(item, searchTerm));
  }, [items, searchTerm, searchFunction]);

  return useFilterTabs(filteredBySearch, selectedItems, compareFunction);
}