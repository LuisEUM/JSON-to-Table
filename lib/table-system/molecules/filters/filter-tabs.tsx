"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type FilterTabType = "todos" | "activos" | "inactivos";

export interface FilterTabsProps {
  children: {
    todos: React.ReactNode;
    activos: React.ReactNode;
    inactivos: React.ReactNode;
  };
  counts: {
    todos: number;
    activos: number;
    inactivos: number;
  };
  defaultTab?: FilterTabType;
  onTabChange?: (tab: FilterTabType) => void;
}

export function FilterTabs({
  children,
  counts,
  defaultTab = "todos",
  onTabChange,
}: FilterTabsProps) {
  const [activeTab, setActiveTab] = useState<FilterTabType>(defaultTab);

  const handleTabChange = (value: string) => {
    const newTab = value as FilterTabType;
    setActiveTab(newTab);
    onTabChange?.(newTab);
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className='w-full h-full flex flex-col'
    >
      <TabsList className='grid w-full grid-cols-3 mb-4'>
        <TabsTrigger value='todos' className='text-xs'>
          Todos ({counts.todos})
        </TabsTrigger>
        <TabsTrigger value='activos' className='text-xs'>
          Activos ({counts.activos})
        </TabsTrigger>
        <TabsTrigger value='inactivos' className='text-xs'>
          Inactivos ({counts.inactivos})
        </TabsTrigger>
      </TabsList>

      <div className='flex-1 overflow-hidden'>
        <TabsContent value='todos' className='h-full m-0'>
          {children.todos}
        </TabsContent>
        <TabsContent value='activos' className='h-full m-0'>
          {children.activos}
        </TabsContent>
        <TabsContent value='inactivos' className='h-full m-0'>
          {children.inactivos}
        </TabsContent>
      </div>
    </Tabs>
  );
}

// Hook para manejar el filtrado de elementos por tab
export function useFilterTabs<T>(
  items: T[],
  selectedItems: T[],
  compareFunction?: (item: T, selected: T) => boolean
) {
  const defaultCompare = (item: T, selected: T) => item === selected;
  const compare = compareFunction || defaultCompare;

  const isSelected = (item: T) =>
    selectedItems.some((selected) => compare(item, selected));

  const filteredItems = {
    todos: items,
    activos: items.filter((item) => isSelected(item)),
    inactivos: items.filter((item) => !isSelected(item)),
  };

  const counts = {
    todos: items.length,
    activos: filteredItems.activos.length,
    inactivos: filteredItems.inactivos.length,
  };

  return {
    filteredItems,
    counts,
    isSelected,
  };
}
