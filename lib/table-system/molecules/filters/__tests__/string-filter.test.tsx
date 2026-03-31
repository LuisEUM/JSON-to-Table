import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, within, act } from "@testing-library/react";
import { StringFilter } from "../string-filter";

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

// Mock Radix UI components
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
    <button
      type="button"
      role="checkbox"
      id={id}
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
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
        data-testid="separator-select"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
      >
        <option value="none">Ninguno</option>
        <option value="tab">Tabulaci&oacute;n</option>
        <option value="semicolon">Punto y coma</option>
        <option value="comma">Coma</option>
        <option value="space">Espacio</option>
        <option value="multispace">M&uacute;ltiples espacios</option>
        <option value="newline">Nueva l&iacute;nea</option>
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
    children: { todos: React.ReactNode; activos: React.ReactNode; inactivos: React.ReactNode };
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

describe("StringFilter", () => {
  const defaultProps = {
    columnId: "test-column",
    columnName: "Test Column",
    columnType: "string",
    uniqueValues: [
      { value: "Apple", count: 5, original: "Apple" },
      { value: "Banana", count: 3, original: "Banana" },
      { value: "Cherry", count: 2, original: "Cherry" },
    ],
    onApply: jest.fn(),
    onClear: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<StringFilter {...defaultProps} />);
    expect(screen.getByText(/Filtro para/)).toBeInTheDocument();
    expect(screen.getByText(/Test Column/)).toBeInTheDocument();
  });

  it("displays unique values as checkboxes", () => {
    render(<StringFilter {...defaultProps} />);
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();
    expect(screen.getByText("Cherry")).toBeInTheDocument();
  });

  it("displays value counts", () => {
    render(<StringFilter {...defaultProps} />);
    expect(screen.getByText("(5)")).toBeInTheDocument();
    expect(screen.getByText("(3)")).toBeInTheDocument();
    expect(screen.getByText("(2)")).toBeInTheDocument();
  });

  it("shows the separator selector", () => {
    render(<StringFilter {...defaultProps} />);
    expect(
      screen.getByText("Separador para dividir valores")
    ).toBeInTheDocument();
  });

  it("shows selection count indicator", () => {
    render(<StringFilter {...defaultProps} />);
    expect(
      screen.getByText(/0 valores seleccionados de 3 disponibles/)
    ).toBeInTheDocument();
  });

  it("renders search input", () => {
    render(<StringFilter {...defaultProps} />);
    expect(screen.getByPlaceholderText("Buscar valores...")).toBeInTheDocument();
  });

  it("selects checkbox value and updates count", () => {
    render(<StringFilter {...defaultProps} />);
    const checkbox = screen.getByTestId("checkbox-string-Apple");
    fireEvent.click(checkbox);
    expect(
      screen.getByText(/1 valores seleccionados de 3 disponibles/)
    ).toBeInTheDocument();
  });

  it("calls onApply with correct FilterCondition when applied", () => {
    render(<StringFilter {...defaultProps} />);
    // Select Apple
    const checkbox = screen.getByTestId("checkbox-string-Apple");
    fireEvent.click(checkbox);
    // Click apply
    const applyButton = screen.getByTestId("check-icon").closest("button")!;
    fireEvent.click(applyButton);
    expect(defaultProps.onApply).toHaveBeenCalledWith({
      field: "test-column",
      operator: "in",
      value: ["Apple"],
      additionalValue: "none",
      exactMatch: false,
    });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("selects multiple values", () => {
    render(<StringFilter {...defaultProps} />);
    fireEvent.click(screen.getByTestId("checkbox-string-Apple"));
    fireEvent.click(screen.getByTestId("checkbox-string-Banana"));
    expect(
      screen.getByText(/2 valores seleccionados de 3 disponibles/)
    ).toBeInTheDocument();
  });

  it("deselects a previously selected value", () => {
    render(<StringFilter {...defaultProps} />);
    fireEvent.click(screen.getByTestId("checkbox-string-Apple")); // select
    // Re-query after re-render (VirtualizedOptionsList is recreated)
    fireEvent.click(screen.getByTestId("checkbox-string-Apple")); // deselect
    expect(
      screen.getByText(/0 valores seleccionados de 3 disponibles/)
    ).toBeInTheDocument();
  });

  it("renders footer with apply/clear/close buttons", () => {
    render(<StringFilter {...defaultProps} />);
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
    expect(screen.getByTestId("trash-icon")).toBeInTheDocument();
    expect(screen.getByTestId("x-icon")).toBeInTheDocument();
  });

  it("hides footer when hideFooter is true", () => {
    render(<StringFilter {...defaultProps} hideFooter={true} />);
    expect(screen.queryByTestId("check-icon")).not.toBeInTheDocument();
  });

  it("filters options by search term", () => {
    render(<StringFilter {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText("Buscar valores...");
    fireEvent.change(searchInput, { target: { value: "App" } });
    // Apple should still be visible, Banana and Cherry should be filtered out
    // We check the rendered tab content
    expect(screen.getByText("Apple")).toBeInTheDocument();
  });

  it("loads initial selected values from initialValue", () => {
    render(
      <StringFilter
        {...defaultProps}
        initialValue={{
          field: "test-column",
          operator: "in",
          value: ["Apple", "Cherry"],
        }}
      />
    );
    expect(
      screen.getByText(/2 valores seleccionados de 3 disponibles/)
    ).toBeInTheDocument();
  });

  it("handles empty unique values", () => {
    render(<StringFilter {...defaultProps} uniqueValues={[]} />);
    expect(screen.getByText(/Filtro para/)).toBeInTheDocument();
    // No checkboxes should be rendered, no "valores seleccionados" text
    expect(screen.queryByText(/valores seleccionados/)).not.toBeInTheDocument();
  });

  it("handles empty string values with (vacio) label", () => {
    render(
      <StringFilter
        {...defaultProps}
        uniqueValues={[{ value: "", count: 1, original: "" }]}
      />
    );
    expect(screen.getByText("(vac\u00EDo)")).toBeInTheDocument();
  });
});
