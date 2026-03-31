import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { NumberFilter } from "../number-filter";

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
jest.mock("@/components/primitives/ui/label", () => ({
  Label: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    htmlFor?: string;
  }) => <label {...props}>{children}</label>,
}));

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

jest.mock("@/components/primitives/ui/switch", () => ({
  Switch: ({
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
      role="switch"
      id={id}
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      data-testid={`switch-${id}`}
    />
  ),
}));

jest.mock("@/components/primitives/ui/select", () => ({
  Select: ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode;
    value: string;
    onValueChange: (v: string) => void;
  }) => (
    <div data-testid="select-container">
      <select
        data-testid="preset-select"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
      >
        <option value="custom">Personalizado</option>
        <option value="positive">Valores positivos</option>
        <option value="negative">Valores negativos</option>
        <option value="aboveAverage">Valores mayores a la media</option>
        <option value="belowAverage">Valores menores a la media</option>
      </select>
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({ children }: { children: React.ReactNode; value: string }) => (
    <div>{children}</div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span>{placeholder}</span>
  ),
}));

jest.mock("@/components/primitives/ui/input", () => ({
  Input: ({
    placeholder,
    value,
    onChange,
    type,
    min,
    max,
    step,
    className,
  }: {
    placeholder?: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    min?: number;
    max?: number;
    step?: string;
    className?: string;
  }) => (
    <input
      placeholder={placeholder}
      value={value ?? ""}
      onChange={onChange}
      type={type}
      min={min}
      max={max}
      step={step}
      className={className}
      data-testid={
        placeholder
          ? `input-${placeholder}`
          : type === "number"
          ? "number-input"
          : "input"
      }
    />
  ),
}));

jest.mock("@/components/primitives/ui/accordion", () => ({
  Accordion: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="accordion">{children}</div>
  ),
  AccordionItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="accordion-item">{children}</div>
  ),
  AccordionTrigger: ({ children }: { children: React.ReactNode }) => (
    <button data-testid="accordion-trigger">{children}</button>
  ),
  AccordionContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="accordion-content">{children}</div>
  ),
}));

jest.mock("@/components/primitives/ui/dialog", () => ({
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
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

describe("NumberFilter", () => {
  const defaultProps = {
    columnId: "amount",
    columnName: "Amount",
    columnType: "number",
    uniqueValues: [
      { value: "10", count: 5, original: "10" },
      { value: "20", count: 3, original: "20" },
      { value: "30", count: 2, original: "30" },
      { value: "50", count: 1, original: "50" },
    ],
    onApply: jest.fn(),
    onClear: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<NumberFilter {...defaultProps} />);
    expect(screen.getByText(/Filtro para:/)).toBeInTheDocument();
    expect(screen.getByText(/Amount/)).toBeInTheDocument();
  });

  it("displays range inputs (Desde/Hasta)", () => {
    render(<NumberFilter {...defaultProps} />);
    expect(screen.getByText("Desde")).toBeInTheDocument();
    expect(screen.getByText("Hasta")).toBeInTheDocument();
  });

  it("displays the preset selector", () => {
    render(<NumberFilter {...defaultProps} />);
    expect(screen.getByTestId("preset-select")).toBeInTheDocument();
  });

  it("displays range mode switch", () => {
    render(<NumberFilter {...defaultProps} />);
    expect(screen.getByTestId("switch-range-mode")).toBeInTheDocument();
  });

  it("shows selected count", () => {
    render(<NumberFilter {...defaultProps} />);
    expect(
      screen.getByText(/\d+ valores seleccionados en el rango/)
    ).toBeInTheDocument();
  });

  it("displays accordion with breakdown", () => {
    render(<NumberFilter {...defaultProps} />);
    expect(
      screen.getByText("Ver desglose por valores")
    ).toBeInTheDocument();
  });

  it("calls onApply with correct values when applying with selections", () => {
    render(<NumberFilter {...defaultProps} />);
    // Click apply - by default all values in range should be selected (isInverted = true)
    const applyButton = screen.getByTestId("check-icon").closest("button")!;
    fireEvent.click(applyButton);
    expect(defaultProps.onApply).toHaveBeenCalledWith(
      expect.objectContaining({
        field: "amount",
        operator: "arrIncludesSome",
      })
    );
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("calls onClear and onClose when no values selected", () => {
    render(
      <NumberFilter
        {...defaultProps}
        uniqueValues={[]}
      />
    );
    const applyButton = screen.getByTestId("check-icon").closest("button")!;
    fireEvent.click(applyButton);
    expect(defaultProps.onClear).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("renders footer by default", () => {
    render(<NumberFilter {...defaultProps} />);
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
  });

  it("hides footer when hideFooter is true", () => {
    render(<NumberFilter {...defaultProps} hideFooter={true} />);
    expect(screen.queryByTestId("check-icon")).not.toBeInTheDocument();
  });

  it("handles values with negative numbers", () => {
    const propsWithNegative = {
      ...defaultProps,
      uniqueValues: [
        { value: "-10", count: 2, original: "-10" },
        { value: "0", count: 3, original: "0" },
        { value: "20", count: 5, original: "20" },
      ],
    };
    render(<NumberFilter {...propsWithNegative} />);
    expect(screen.getByText(/Filtro para:/)).toBeInTheDocument();
  });

  it("handles empty unique values", () => {
    render(<NumberFilter {...defaultProps} uniqueValues={[]} />);
    expect(
      screen.getByText("No hay valores num\u00E9ricos disponibles")
    ).toBeInTheDocument();
  });

  it("handles decimal comma notation", () => {
    const propsWithComma = {
      ...defaultProps,
      uniqueValues: [
        { value: "10,5", count: 1, original: "10,5" },
        { value: "20,3", count: 1, original: "20,3" },
      ],
    };
    render(<NumberFilter {...propsWithComma} />);
    expect(screen.getByText(/Filtro para:/)).toBeInTheDocument();
  });
});
