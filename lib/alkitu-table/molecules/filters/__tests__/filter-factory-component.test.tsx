import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { FilterFactory } from "../filter-factory";
import { FilterContext } from "../../../core/contexts/filter-context";

// Mock logger
jest.mock("../../../core/services/logging-service", () => ({
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

// Mock the child filter components to isolate FilterFactory logic
jest.mock("../string-filter", () => ({
  StringFilter: (props: Record<string, unknown>) => (
    <div data-testid="string-filter" data-column={props.columnId}>
      StringFilter
    </div>
  ),
}));

jest.mock("../number-filter", () => ({
  NumberFilter: (props: Record<string, unknown>) => (
    <div data-testid="number-filter" data-column={props.columnId}>
      NumberFilter
    </div>
  ),
}));

jest.mock("../date-filter", () => ({
  DateFilter: (props: Record<string, unknown>) => (
    <div data-testid="date-filter" data-column={props.columnId}>
      DateFilter
    </div>
  ),
}));

jest.mock("../array-filter", () => ({
  ArrayFilter: (props: Record<string, unknown>) => (
    <div data-testid="array-filter" data-column={props.columnId}>
      ArrayFilter
    </div>
  ),
}));

jest.mock("../atomic-primitive-array-filter", () => ({
  AtomicPrimitiveArrayFilter: (props: Record<string, unknown>) => (
    <div data-testid="primitive-array-filter" data-column={props.columnId}>
      PrimitiveArrayFilter
    </div>
  ),
}));

jest.mock("../object-property-filter", () => ({
  ObjectPropertyFilter: (props: Record<string, unknown>) => (
    <div data-testid="object-property-filter" data-column={props.columnId}>
      ObjectPropertyFilter
    </div>
  ),
}));

jest.mock("../pattern-analyzer", () => ({
  DataPatternAnalyzer: {
    analyzeColumn: jest.fn(() => ({ type: "simple" })),
  },
}));

jest.mock("@/components/primitives/ui/dialog", () => ({
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Helper to create a mock column object
function createMockColumn(overrides: {
  id?: string;
  type?: string;
  firstValue?: unknown;
  facetedValues?: Map<unknown, number>;
  minMax?: [number | undefined, number | undefined];
}) {
  const {
    id = "test-col",
    type = "string",
    firstValue = { type: "string", value: "test" },
    facetedValues = new Map([
      [{ type: "string", value: "a" }, 1],
      [{ type: "string", value: "b" }, 2],
    ]),
    minMax = [undefined, undefined],
  } = overrides;

  return {
    id,
    columnDef: {
      meta: { type },
      accessorFn: () => firstValue,
    },
    getFacetedUniqueValues: () => facetedValues,
    getFacetedMinMaxValues: () => minMax,
    getFacetedRowModel: () => ({
      rows: [
        {
          original: {
            [id]: firstValue,
          },
        },
      ],
    }),
    getFilterValue: () => undefined,
  };
}

const mockFilterContext = {
  applyFilter: jest.fn(),
  clearFilter: jest.fn(),
  clearAllFilters: jest.fn(),
  activeFilterCount: 0,
};

const defaultProps = {
  columnId: "test-col",
  columnName: "Test",
  columnType: "string",
  uniqueValues: [{ value: "a", count: 1, original: "a" }],
  onApply: jest.fn(),
  onClear: jest.fn(),
  onClose: jest.fn(),
};

function renderWithContext(ui: React.ReactElement) {
  return render(
    <FilterContext.Provider value={mockFilterContext}>{ui}</FilterContext.Provider>
  );
}

describe("FilterFactory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders StringFilter for string type columns", () => {
    const column = createMockColumn({ type: "string" });
    renderWithContext(
      <FilterFactory {...defaultProps} column={column as never} />
    );
    expect(screen.getByTestId("string-filter")).toBeInTheDocument();
  });

  it("renders NumberFilter for number type columns", () => {
    const column = createMockColumn({
      type: "number",
      firstValue: { type: "number", value: 42 },
    });
    renderWithContext(
      <FilterFactory {...defaultProps} column={column as never} />
    );
    expect(screen.getByTestId("number-filter")).toBeInTheDocument();
  });

  it("renders DateFilter for date type columns", () => {
    const column = createMockColumn({
      type: "date",
      firstValue: { type: "date", value: "2024-01-01" },
    });
    renderWithContext(
      <FilterFactory {...defaultProps} column={column as never} />
    );
    expect(screen.getByTestId("date-filter")).toBeInTheDocument();
  });

  it("renders ArrayFilter for array type columns", () => {
    const column = createMockColumn({
      type: "array",
      firstValue: { type: "array", value: ["a", "b"] },
    });
    renderWithContext(
      <FilterFactory {...defaultProps} column={column as never} />
    );
    expect(screen.getByTestId("array-filter")).toBeInTheDocument();
  });

  it("renders PrimitiveArrayFilter for primitiveArray type columns", () => {
    const column = createMockColumn({
      type: "primitiveArray",
      firstValue: { type: "primitiveArray", value: ["a", "b"] },
    });
    renderWithContext(
      <FilterFactory {...defaultProps} column={column as never} />
    );
    expect(screen.getByTestId("primitive-array-filter")).toBeInTheDocument();
  });

  it("renders ArrayFilter for objectArray type columns", () => {
    const column = createMockColumn({
      type: "objectArray",
      firstValue: {
        type: "objectArray",
        value: [{ name: "test" }],
      },
    });
    renderWithContext(
      <FilterFactory {...defaultProps} column={column as never} />
    );
    expect(screen.getByTestId("array-filter")).toBeInTheDocument();
  });

  it("renders StringFilter for boolean type columns", () => {
    const column = createMockColumn({
      type: "boolean",
      firstValue: { type: "boolean", value: true },
    });
    renderWithContext(
      <FilterFactory {...defaultProps} column={column as never} />
    );
    expect(screen.getByTestId("string-filter")).toBeInTheDocument();
  });

  it("renders StringFilter when no firstValue is available", () => {
    const column = createMockColumn({});
    // Override to return empty iterator
    column.getFacetedUniqueValues = () => new Map();
    column.columnDef.accessorFn = () => undefined;
    renderWithContext(
      <FilterFactory {...defaultProps} column={column as never} />
    );
    expect(screen.getByTestId("string-filter")).toBeInTheDocument();
  });
});
