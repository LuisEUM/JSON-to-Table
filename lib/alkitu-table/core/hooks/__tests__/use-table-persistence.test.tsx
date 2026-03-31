import { renderHook, act } from "@testing-library/react";
import { useTablePersistence } from "../use-table-persistence";
import { toast } from "sonner";

// Mock sonner
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

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

describe("useTablePersistence", () => {
  const mockState = {
    columnOrder: ["col1", "col2"],
    columnVisibility: { col1: true, col2: false },
    useFixedColumn: true,
    fixedColumnId: "col1",
    sorting: [{ id: "col1", desc: false }],
    columnFilters: [],
    globalFilter: "",
  };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe("storage keys", () => {
    it("uses main prefix for main table", () => {
      const { result } = renderHook(() =>
        useTablePersistence({ isSecondaryTable: false })
      );

      expect(result.current.getStorageKey("current")).toBe(
        "table-config-main-current"
      );
    });

    it("uses secondary prefix with parent name for secondary table", () => {
      const { result } = renderHook(() =>
        useTablePersistence({
          isSecondaryTable: true,
          parentTableInfo: { id: "1", name: "contacts" },
        })
      );

      expect(result.current.getStorageKey("current")).toBe(
        "table-config-contacts-current"
      );
    });

    it("uses fallback name when parent name is missing", () => {
      const { result } = renderHook(() =>
        useTablePersistence({ isSecondaryTable: true })
      );

      expect(result.current.getStorageKey("current")).toBe(
        "table-config-secondary-current"
      );
    });
  });

  describe("saveColumnConfiguration", () => {
    it("stores data in localStorage", () => {
      const { result } = renderHook(() =>
        useTablePersistence({ isSecondaryTable: false })
      );

      act(() => {
        result.current.saveColumnConfiguration(mockState);
      });

      const stored = localStorage.getItem("table-config-main-current");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.columnOrder).toEqual(["col1", "col2"]);
      expect(parsed.columnVisibility).toEqual({ col1: true, col2: false });
      expect(parsed.timestamp).toBeDefined();
    });
  });

  describe("loadColumnConfiguration", () => {
    it("retrieves saved data", () => {
      const { result } = renderHook(() =>
        useTablePersistence({ isSecondaryTable: false })
      );

      act(() => {
        result.current.saveColumnConfiguration(mockState);
      });

      let loaded: ReturnType<typeof result.current.loadColumnConfiguration>;
      act(() => {
        loaded = result.current.loadColumnConfiguration();
      });

      expect(loaded!).not.toBeNull();
      expect(loaded!.columnOrder).toEqual(["col1", "col2"]);
    });

    it("returns null when no saved data exists", () => {
      const { result } = renderHook(() =>
        useTablePersistence({ isSecondaryTable: false })
      );

      let loaded: ReturnType<typeof result.current.loadColumnConfiguration>;
      act(() => {
        loaded = result.current.loadColumnConfiguration();
      });

      expect(loaded!).toBeNull();
    });

    it("handles localStorage errors gracefully", () => {
      const { result } = renderHook(() =>
        useTablePersistence({ isSecondaryTable: false })
      );

      // Store invalid JSON
      localStorage.setItem("table-config-main-current", "not valid json{{{");

      let loaded: ReturnType<typeof result.current.loadColumnConfiguration>;
      act(() => {
        loaded = result.current.loadColumnConfiguration();
      });

      expect(loaded!).toBeNull();
    });
  });

  describe("saveAsDefaultConfiguration", () => {
    it("stores data and shows toast", () => {
      const { result } = renderHook(() =>
        useTablePersistence({ isSecondaryTable: false })
      );

      const defaultState = {
        columnOrder: ["col1"],
        columnVisibility: { col1: true },
        useFixedColumn: false,
        fixedColumnId: null,
      };

      act(() => {
        result.current.saveAsDefaultConfiguration(defaultState);
      });

      const stored = localStorage.getItem("table-config-main-default");
      expect(stored).not.toBeNull();
      expect(toast.success).toHaveBeenCalledWith(
        "Configuraci\u00f3n guardada como predeterminada"
      );
    });
  });

  describe("loadDefaultConfiguration", () => {
    it("retrieves default config", () => {
      const { result } = renderHook(() =>
        useTablePersistence({ isSecondaryTable: false })
      );

      const defaultState = {
        columnOrder: ["col1"],
        columnVisibility: { col1: true },
        useFixedColumn: false,
        fixedColumnId: null,
      };

      act(() => {
        result.current.saveAsDefaultConfiguration(defaultState);
      });

      let loaded: ReturnType<typeof result.current.loadDefaultConfiguration>;
      act(() => {
        loaded = result.current.loadDefaultConfiguration();
      });

      expect(loaded!).not.toBeNull();
      expect(loaded!.columnOrder).toEqual(["col1"]);
    });

    it("returns null when no default exists", () => {
      const { result } = renderHook(() =>
        useTablePersistence({ isSecondaryTable: false })
      );

      let loaded: ReturnType<typeof result.current.loadDefaultConfiguration>;
      act(() => {
        loaded = result.current.loadDefaultConfiguration();
      });

      expect(loaded!).toBeNull();
    });

    it("handles localStorage errors gracefully", () => {
      const { result } = renderHook(() =>
        useTablePersistence({ isSecondaryTable: false })
      );

      localStorage.setItem("table-config-main-default", "{{invalid");

      let loaded: ReturnType<typeof result.current.loadDefaultConfiguration>;
      act(() => {
        loaded = result.current.loadDefaultConfiguration();
      });

      expect(loaded!).toBeNull();
    });
  });
});
