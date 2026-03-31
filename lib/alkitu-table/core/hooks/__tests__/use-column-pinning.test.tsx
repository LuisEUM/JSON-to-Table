import { renderHook } from "@testing-library/react";
import { useColumnPinning } from "../use-column-pinning";

// Mock logger
jest.mock("../../services/logging-service", () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    setLevel: jest.fn(),
    getLevel: jest.fn(),
  },
}));

describe("useColumnPinning", () => {
  describe("getEffectiveColumnOrder", () => {
    it("returns base order when no fixed column", () => {
      const { result } = renderHook(() =>
        useColumnPinning({
          columnOrder: ["col1", "col2", "col3"],
          originalColumnOrder: [],
          useFixedColumn: false,
          fixedColumnId: null,
        })
      );

      expect(result.current.getEffectiveColumnOrder()).toEqual([
        "col1",
        "col2",
        "col3",
      ]);
    });

    it("falls back to originalColumnOrder when columnOrder is empty", () => {
      const { result } = renderHook(() =>
        useColumnPinning({
          columnOrder: [],
          originalColumnOrder: ["colA", "colB"],
          useFixedColumn: false,
          fixedColumnId: null,
        })
      );

      expect(result.current.getEffectiveColumnOrder()).toEqual([
        "colA",
        "colB",
      ]);
    });

    it("keeps actions column always last", () => {
      const { result } = renderHook(() =>
        useColumnPinning({
          columnOrder: ["col1", "actions", "col2"],
          originalColumnOrder: [],
          useFixedColumn: false,
          fixedColumnId: null,
        })
      );

      expect(result.current.getEffectiveColumnOrder()).toEqual([
        "col1",
        "col2",
        "actions",
      ]);
    });

    it("moves pinned column to start", () => {
      const { result } = renderHook(() =>
        useColumnPinning({
          columnOrder: ["col1", "col2", "col3"],
          originalColumnOrder: [],
          useFixedColumn: true,
          fixedColumnId: "col2",
        })
      );

      const order = result.current.getEffectiveColumnOrder();
      expect(order[0]).toBe("col2");
      expect(order).toEqual(["col2", "col1", "col3"]);
    });

    it("moves pinned column to start with actions last", () => {
      const { result } = renderHook(() =>
        useColumnPinning({
          columnOrder: ["col1", "col2", "actions", "col3"],
          originalColumnOrder: [],
          useFixedColumn: true,
          fixedColumnId: "col3",
        })
      );

      const order = result.current.getEffectiveColumnOrder();
      expect(order[0]).toBe("col3");
      expect(order[order.length - 1]).toBe("actions");
      expect(order).toEqual(["col3", "col1", "col2", "actions"]);
    });

    it("uses index as default pinned column when fixedColumnId is null", () => {
      const { result } = renderHook(() =>
        useColumnPinning({
          columnOrder: ["col1", "index", "col2"],
          originalColumnOrder: [],
          useFixedColumn: true,
          fixedColumnId: null,
        })
      );

      const order = result.current.getEffectiveColumnOrder();
      expect(order[0]).toBe("index");
    });

    it("adds pinned column to start if not in base order", () => {
      const { result } = renderHook(() =>
        useColumnPinning({
          columnOrder: ["col1", "col2"],
          originalColumnOrder: [],
          useFixedColumn: true,
          fixedColumnId: "newCol",
        })
      );

      const order = result.current.getEffectiveColumnOrder();
      expect(order[0]).toBe("newCol");
      expect(order).toEqual(["newCol", "col1", "col2"]);
    });

    it("works with empty column order and no fixed column", () => {
      const { result } = renderHook(() =>
        useColumnPinning({
          columnOrder: [],
          originalColumnOrder: [],
          useFixedColumn: false,
          fixedColumnId: null,
        })
      );

      expect(result.current.getEffectiveColumnOrder()).toEqual([]);
    });

    it("returns getTanStackPinningStyles function", () => {
      const { result } = renderHook(() =>
        useColumnPinning({
          columnOrder: [],
          originalColumnOrder: [],
          useFixedColumn: false,
          fixedColumnId: null,
        })
      );

      expect(typeof result.current.getTanStackPinningStyles).toBe("function");
    });
  });
});
