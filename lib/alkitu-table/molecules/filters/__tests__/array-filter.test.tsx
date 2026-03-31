import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { ArrayFilter } from "../array-filter";

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

// Mock processValue from core
jest.mock("../../../core", () => ({
  processValue: (value: unknown) => ({
    value,
    type: typeof value === "number" ? "number" : "string",
  }),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Search: (props: Record<string, unknown>) =>
    React.createElement("svg", { "data-testid": "search-icon", ...props }),
  Check: (props: Record<string, unknown>) =>
    React.createElement("svg", { "data-testid": "check-icon", ...props }),
  Trash2: (props: Record<string, unknown>) =>
    React.createElement("svg", { "data-testid": "trash-icon", ...props }),
  X: (props: Record<string, unknown>) =>
    React.createElement("svg", { "data-testid": "x-icon", ...props }),
  CheckSquare: (props: Record<string, unknown>) =>
    React.createElement("svg", {
      "data-testid": "check-square-icon",
      ...props,
    }),
}));

// Mock UI components
jest.mock("@/components/primitives/ui/checkbox", () => ({
  Checkbox: ({
    id,
    checked,
    onCheckedChange,
  }: {
    id: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
  }) => (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      data-testid={`checkbox-${id}`}
    />
  ),
}));

jest.mock("@/components/primitives/ui/scroll-area", () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="scroll-area">{children}</div>
  ),
}));

jest.mock("@/components/primitives/ui/input", () => ({
  Input: ({
    placeholder,
    value,
    onChange,
    className,
  }: {
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
  }) => (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      data-testid="search-input"
    />
  ),
}));

// Mock Tooltip
jest.mock("@/components/primitives/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TooltipTrigger: React.forwardRef(
    (
      { children }: { children: React.ReactNode; asChild?: boolean },
      ref: React.Ref<HTMLDivElement>
    ) => <div ref={ref}>{children}</div>
  ),
  TooltipProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock("@/components/primitives/ui/button", () => ({
  Button: React.forwardRef(
    (
      {
        children,
        onClick,
        ...props
      }: { children: React.ReactNode; onClick?: () => void },
      ref: React.Ref<HTMLButtonElement>
    ) => (
      <button ref={ref} onClick={onClick} {...props}>
        {children}
      </button>
    )
  ),
}));

// Mock TypeDot
jest.mock("../../../atoms/indicators/TypeDot", () => ({
  TypeDot: ({ type }: { type: string }) => (
    <span data-testid={`type-dot-${type}`} />
  ),
}));

// Mock FilterTabs
jest.mock("../filter-tabs", () => ({
  FilterTabs: ({
    children,
    counts,
  }: {
    children: {
      todos: React.ReactNode;
      activos: React.ReactNode;
      inactivos: React.ReactNode;
    };
    counts: { todos: number; activos: number; inactivos: number };
  }) => (
    <div data-testid="filter-tabs">
      <span data-testid="tab-count-todos">{counts.todos}</span>
      <div data-testid="tab-todos">{children.todos}</div>
    </div>
  ),
  useFilterTabs: <T,>(
    items: T[],
    selectedItems: T[],
    compareFn?: (item: T, selected: T) => boolean
  ) => {
    const compare = compareFn || ((a: T, b: T) => a === b);
    const isSelected = (item: T) =>
      selectedItems.some((s) => compare(item, s));
    return {
      filteredItems: {
        todos: items,
        activos: items.filter(isSelected),
        inactivos: items.filter((i) => !isSelected(i)),
      },
      counts: {
        todos: items.length,
        activos: items.filter(isSelected).length,
        inactivos: items.filter((i) => !isSelected(i)).length,
      },
      isSelected,
    };
  },
}));

describe("ArrayFilter", () => {
  const defaultProps = {
    columnId: "tags",
    columnName: "Tags",
    columnType: "array",
    uniqueValues: [
      {
        value: { type: "primitiveArray", value: ["red", "blue"] },
        count: 3,
        original: { type: "primitiveArray", value: ["red", "blue"] },
      },
      {
        value: { type: "primitiveArray", value: ["green"] },
        count: 2,
        original: { type: "primitiveArray", value: ["green"] },
      },
    ],
    onApply: jest.fn(),
    onClear: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<ArrayFilter {...defaultProps} />);
    expect(screen.getByText(/Filtro para array de tipo:/)).toBeInTheDocument();
    expect(screen.getByText(/Tags/)).toBeInTheDocument();
  });

  it("displays search input", () => {
    render(<ArrayFilter {...defaultProps} />);
    expect(screen.getByPlaceholderText("Buscar valores...")).toBeInTheDocument();
  });

  it("displays selection count", () => {
    render(<ArrayFilter {...defaultProps} />);
    expect(screen.getByText(/0 de \d+ seleccionados/)).toBeInTheDocument();
  });

  it("renders footer by default", () => {
    render(<ArrayFilter {...defaultProps} />);
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
  });

  it("hides footer when hideFooter is true", () => {
    render(<ArrayFilter {...defaultProps} hideFooter={true} />);
    expect(screen.queryByTestId("check-icon")).not.toBeInTheDocument();
  });

  it("calls onApply when apply button is clicked", () => {
    render(<ArrayFilter {...defaultProps} />);
    const applyButton = screen.getByTestId("check-icon").closest("button")!;
    fireEvent.click(applyButton);
    expect(defaultProps.onApply).toHaveBeenCalledWith(
      expect.objectContaining({
        field: "tags",
        operator: "arrIncludesSome",
      })
    );
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("handles empty unique values", () => {
    render(<ArrayFilter {...defaultProps} uniqueValues={[]} />);
    expect(screen.getByText(/Filtro para array de tipo:/)).toBeInTheDocument();
    expect(screen.getByText(/0 de 0 seleccionados/)).toBeInTheDocument();
  });

  it("uses provided arrayType", () => {
    render(<ArrayFilter {...defaultProps} arrayType="objectArray" />);
    expect(screen.getByText(/objectArray/)).toBeInTheDocument();
  });

  it("renders filter tabs", () => {
    render(<ArrayFilter {...defaultProps} />);
    expect(screen.getByTestId("filter-tabs")).toBeInTheDocument();
  });
});
