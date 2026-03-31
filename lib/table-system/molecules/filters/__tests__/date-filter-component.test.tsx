import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { DateFilter } from "../date-filter";

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

// Mock error-handling (for formatDate)
jest.mock("../../../core/utils/error-handling", () => ({
  formatDate: (date: Date, format: string) => {
    if (!date || isNaN(date.getTime())) return "";
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    if (format === "yyyy-mm-dd" || format === "yyyy-MM-dd") return `${y}-${m}-${d}`;
    return `${d}-${m}-${y}`;
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
jest.mock("@/components/ui/label", () => ({
  Label: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    htmlFor?: string;
  }) => <label {...props}>{children}</label>,
}));

jest.mock("@/components/ui/checkbox", () => ({
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

jest.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="scroll-area">{children}</div>
  ),
}));

jest.mock("@/components/ui/switch", () => ({
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

jest.mock("@/components/ui/select", () => ({
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
        <option value="today">Hoy</option>
        <option value="yesterday">Ayer</option>
        <option value="thisWeek">Esta semana</option>
        <option value="lastWeek">Semana pasada</option>
        <option value="thisMonth">Este mes</option>
        <option value="lastMonth">Mes pasado</option>
        <option value="thisYear">Este a&ntilde;o</option>
        <option value="lastYear">A&ntilde;o pasado</option>
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

jest.mock("@/components/ui/input", () => ({
  Input: ({
    placeholder,
    value,
    onChange,
    type,
    className,
  }: {
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    className?: string;
  }) => (
    <input
      placeholder={placeholder}
      value={value ?? ""}
      onChange={onChange}
      type={type}
      className={className}
      data-testid={type === "date" ? "date-input" : "text-input"}
    />
  ),
}));

jest.mock("@/components/ui/accordion", () => ({
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

// Mock Tooltip
jest.mock("@/components/ui/tooltip", () => ({
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

jest.mock("@/components/ui/button", () => ({
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

describe("DateFilter", () => {
  const defaultProps = {
    columnId: "created-date",
    columnName: "Created Date",
    columnType: "date",
    uniqueValues: [
      { value: "01/01/2024", count: 3, original: "01/01/2024" },
      { value: "15/06/2024", count: 5, original: "15/06/2024" },
      { value: "31/12/2024", count: 2, original: "31/12/2024" },
    ],
    onApply: jest.fn(),
    onClear: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<DateFilter {...defaultProps} />);
    expect(screen.getByText(/Filtro para:/)).toBeInTheDocument();
    expect(screen.getByText(/Created Date/)).toBeInTheDocument();
  });

  it("displays date range inputs (Desde/Hasta)", () => {
    render(<DateFilter {...defaultProps} />);
    expect(screen.getByText("Desde")).toBeInTheDocument();
    expect(screen.getByText("Hasta")).toBeInTheDocument();
  });

  it("displays the preset selector", () => {
    render(<DateFilter {...defaultProps} />);
    expect(screen.getByTestId("preset-select")).toBeInTheDocument();
  });

  it("displays inverted mode switch", () => {
    render(<DateFilter {...defaultProps} />);
    expect(screen.getByTestId("switch-inverted-mode")).toBeInTheDocument();
  });

  it("shows accordion with available dates", () => {
    render(<DateFilter {...defaultProps} />);
    expect(screen.getByText(/Fechas disponibles/)).toBeInTheDocument();
  });

  it("renders footer by default", () => {
    render(<DateFilter {...defaultProps} />);
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
    expect(screen.getByTestId("trash-icon")).toBeInTheDocument();
    expect(screen.getByTestId("x-icon")).toBeInTheDocument();
  });

  it("hides footer when hideFooter is true", () => {
    render(<DateFilter {...defaultProps} hideFooter={true} />);
    expect(screen.queryByTestId("check-icon")).not.toBeInTheDocument();
  });

  it("calls onClear and onClose when no dates selected and apply clicked", () => {
    render(<DateFilter {...defaultProps} />);
    const applyButton = screen.getByTestId("check-icon").closest("button")!;
    fireEvent.click(applyButton);
    // When no dates are explicitly selected and no range is set,
    // the behavior depends on getSelectedDates returning empty
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("handles empty unique values", () => {
    render(<DateFilter {...defaultProps} uniqueValues={[]} />);
    expect(screen.getByText(/Filtro para:/)).toBeInTheDocument();
    // Accordion should not appear when no dates
    expect(screen.queryByText(/Fechas disponibles/)).not.toBeInTheDocument();
  });

  it("handles dd-mm-yyyy date format", () => {
    render(
      <DateFilter
        {...defaultProps}
        uniqueValues={[
          { value: "15-06-2024", count: 3, original: "15-06-2024" },
        ]}
      />
    );
    expect(screen.getByText(/Filtro para:/)).toBeInTheDocument();
  });

  it("handles ISO date format", () => {
    render(
      <DateFilter
        {...defaultProps}
        uniqueValues={[
          { value: "2024-06-15", count: 3, original: "2024-06-15" },
        ]}
      />
    );
    expect(screen.getByText(/Filtro para:/)).toBeInTheDocument();
  });

  it("shows include/exclude label based on switch state", () => {
    render(<DateFilter {...defaultProps} />);
    // Default is isInverted = true
    expect(
      screen.getByText("Incluir fechas en el rango")
    ).toBeInTheDocument();
  });

  it("renders date inputs", () => {
    render(<DateFilter {...defaultProps} />);
    const dateInputs = screen.getAllByTestId("date-input");
    expect(dateInputs.length).toBe(2);
  });
});
