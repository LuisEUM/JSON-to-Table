"use client";

import { createContext } from "react";
import { FilterCondition } from "../../molecules/filters/filter-types";

export interface FilterContextValue {
  applyFilter: (columnId: string, filterValue: FilterCondition) => void;
  clearFilter: (columnId: string) => void;
  clearAllFilters: () => void;
  activeFilterCount: number;
}

export const FilterContext = createContext<FilterContextValue>({
  applyFilter: () => {},
  clearFilter: () => {},
  clearAllFilters: () => {},
  activeFilterCount: 0,
});
