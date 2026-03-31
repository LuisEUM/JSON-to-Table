import React from "react";
import { renderHook } from "@testing-library/react";

// Mock the Tabs UI components since filter-tabs.tsx imports them
jest.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => children,
  TabsList: ({ children }: { children: React.ReactNode }) => children,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => children,
  TabsContent: ({ children }: { children: React.ReactNode }) => children,
}));

import { useFilterTabs } from "../../../molecules/filters/filter-tabs";

describe("useFilterTabs", () => {
  describe("filtering items by active/inactive", () => {
    it("returns all items in todos", () => {
      const items = [1, 2, 3, 4, 5];
      const selectedItems = [2, 4];

      const { result } = renderHook(() => useFilterTabs(items, selectedItems));

      expect(result.current.filteredItems.todos).toEqual([1, 2, 3, 4, 5]);
    });

    it("returns only selected items in activos", () => {
      const items = [1, 2, 3, 4, 5];
      const selectedItems = [2, 4];

      const { result } = renderHook(() => useFilterTabs(items, selectedItems));

      expect(result.current.filteredItems.activos).toEqual([2, 4]);
    });

    it("returns only unselected items in inactivos", () => {
      const items = [1, 2, 3, 4, 5];
      const selectedItems = [2, 4];

      const { result } = renderHook(() => useFilterTabs(items, selectedItems));

      expect(result.current.filteredItems.inactivos).toEqual([1, 3, 5]);
    });

    it("handles empty selectedItems", () => {
      const items = ["a", "b", "c"];
      const selectedItems: string[] = [];

      const { result } = renderHook(() => useFilterTabs(items, selectedItems));

      expect(result.current.filteredItems.activos).toEqual([]);
      expect(result.current.filteredItems.inactivos).toEqual(["a", "b", "c"]);
    });

    it("handles all items selected", () => {
      const items = [1, 2, 3];
      const selectedItems = [1, 2, 3];

      const { result } = renderHook(() => useFilterTabs(items, selectedItems));

      expect(result.current.filteredItems.activos).toEqual([1, 2, 3]);
      expect(result.current.filteredItems.inactivos).toEqual([]);
    });
  });

  describe("custom compare function", () => {
    it("uses custom compare for object items", () => {
      const items = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 3, name: "Carol" },
      ];
      const selectedItems = [{ id: 2, name: "Bob" }];
      const compare = (a: { id: number }, b: { id: number }) => a.id === b.id;

      const { result } = renderHook(() =>
        useFilterTabs(items, selectedItems, compare)
      );

      expect(result.current.filteredItems.activos).toEqual([
        { id: 2, name: "Bob" },
      ]);
      expect(result.current.filteredItems.inactivos).toEqual([
        { id: 1, name: "Alice" },
        { id: 3, name: "Carol" },
      ]);
    });
  });

  describe("counts", () => {
    it("returns correct counts", () => {
      const items = [1, 2, 3, 4, 5];
      const selectedItems = [2, 4];

      const { result } = renderHook(() => useFilterTabs(items, selectedItems));

      expect(result.current.counts).toEqual({
        todos: 5,
        activos: 2,
        inactivos: 3,
      });
    });

    it("returns zero counts for empty arrays", () => {
      const items: number[] = [];
      const selectedItems: number[] = [];

      const { result } = renderHook(() => useFilterTabs(items, selectedItems));

      expect(result.current.counts).toEqual({
        todos: 0,
        activos: 0,
        inactivos: 0,
      });
    });
  });

  describe("isSelected", () => {
    it("returns true for selected items", () => {
      const items = [1, 2, 3];
      const selectedItems = [2];

      const { result } = renderHook(() => useFilterTabs(items, selectedItems));

      expect(result.current.isSelected(2)).toBe(true);
    });

    it("returns false for unselected items", () => {
      const items = [1, 2, 3];
      const selectedItems = [2];

      const { result } = renderHook(() => useFilterTabs(items, selectedItems));

      expect(result.current.isSelected(1)).toBe(false);
    });
  });
});
