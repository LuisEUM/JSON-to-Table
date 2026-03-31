import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { SortControl } from "../sort-control";
import { FilterControl } from "../filter-control";
import { VisibilityControl } from "../visibility-control";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  ArrowUp: (props: Record<string, unknown>) =>
    React.createElement("svg", { "data-testid": "arrow-up-icon", ...props }),
  ArrowDown: (props: Record<string, unknown>) =>
    React.createElement("svg", { "data-testid": "arrow-down-icon", ...props }),
  ArrowUpDown: (props: Record<string, unknown>) =>
    React.createElement("svg", {
      "data-testid": "arrow-up-down-icon",
      ...props,
    }),
  Filter: (props: Record<string, unknown>) =>
    React.createElement("svg", { "data-testid": "filter-icon", ...props }),
  Eye: (props: Record<string, unknown>) =>
    React.createElement("svg", { "data-testid": "eye-icon", ...props }),
  EyeOff: (props: Record<string, unknown>) =>
    React.createElement("svg", { "data-testid": "eye-off-icon", ...props }),
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
        disabled,
        className,
        ...props
      }: {
        children: React.ReactNode;
        onClick?: () => void;
        disabled?: boolean;
        className?: string;
      },
      ref: React.Ref<HTMLButtonElement>
    ) => (
      <button
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        className={className}
        {...props}
      >
        {children}
      </button>
    )
  ),
}));

// ─── SortControl ────────────────────────────────────────────────────────────

describe("SortControl", () => {
  const defaultProps = {
    direction: false as const,
    sortType: "text" as const,
    onSort: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<SortControl {...defaultProps} />);
    expect(screen.getByTestId("arrow-up-down-icon")).toBeInTheDocument();
  });

  it("shows ArrowUpDown icon when no direction", () => {
    render(<SortControl {...defaultProps} direction={false} />);
    expect(screen.getByTestId("arrow-up-down-icon")).toBeInTheDocument();
  });

  it("shows ArrowUp icon when direction is asc", () => {
    render(<SortControl {...defaultProps} direction="asc" />);
    expect(screen.getByTestId("arrow-up-icon")).toBeInTheDocument();
  });

  it("shows ArrowDown icon when direction is desc", () => {
    render(<SortControl {...defaultProps} direction="desc" />);
    expect(screen.getByTestId("arrow-down-icon")).toBeInTheDocument();
  });

  it("cycles from none to asc on click", () => {
    render(<SortControl {...defaultProps} direction={false} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(defaultProps.onSort).toHaveBeenCalledWith("asc");
  });

  it("cycles from asc to desc on click", () => {
    render(<SortControl {...defaultProps} direction="asc" />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(defaultProps.onSort).toHaveBeenCalledWith("desc");
  });

  it("cycles from desc to none on click", () => {
    render(<SortControl {...defaultProps} direction="desc" />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(defaultProps.onSort).toHaveBeenCalledWith(false);
  });

  it("does not call onSort when disabled", () => {
    render(<SortControl {...defaultProps} disabled={true} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(defaultProps.onSort).not.toHaveBeenCalled();
  });

  it("displays correct tooltip for text sort", () => {
    render(<SortControl {...defaultProps} sortType="text" />);
    expect(
      screen.getByText(/Ordenar alfab\u00E9ticamente/)
    ).toBeInTheDocument();
  });

  it("displays correct tooltip for numeric sort", () => {
    render(<SortControl {...defaultProps} sortType="numeric" />);
    expect(
      screen.getByText(/Ordenar num\u00E9ricamente/)
    ).toBeInTheDocument();
  });

  it("displays correct tooltip for datetime sort", () => {
    render(<SortControl {...defaultProps} sortType="datetime" />);
    expect(screen.getByText(/Ordenar por fecha/)).toBeInTheDocument();
  });

  it("displays correct tooltip for none sortType", () => {
    render(<SortControl {...defaultProps} sortType="none" />);
    expect(
      screen.getByText("No se puede ordenar este tipo de dato")
    ).toBeInTheDocument();
  });

  it("shows asc tooltip for text", () => {
    render(
      <SortControl {...defaultProps} direction="asc" sortType="text" />
    );
    expect(
      screen.getByText(/Ordenado de A a Z - Click para invertir/)
    ).toBeInTheDocument();
  });

  it("shows desc tooltip for numeric", () => {
    render(
      <SortControl {...defaultProps} direction="desc" sortType="numeric" />
    );
    expect(
      screen.getByText(
        /Ordenado de mayor a menor - Click para quitar ordenamiento/
      )
    ).toBeInTheDocument();
  });
});

// ─── FilterControl ──────────────────────────────────────────────────────────

describe("FilterControl", () => {
  const defaultProps = {
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<FilterControl {...defaultProps} />);
    expect(screen.getByTestId("filter-icon")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    render(<FilterControl {...defaultProps} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    render(<FilterControl {...defaultProps} disabled={true} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(defaultProps.onClick).not.toHaveBeenCalled();
  });

  it("shows active indicator when isActive", () => {
    const { container } = render(
      <FilterControl {...defaultProps} isActive={true} />
    );
    // Active filter shows a small red dot
    const dot = container.querySelector(".bg-red-500");
    expect(dot).toBeInTheDocument();
  });

  it("does not show active indicator when not active", () => {
    const { container } = render(
      <FilterControl {...defaultProps} isActive={false} />
    );
    const dot = container.querySelector(".bg-red-500");
    expect(dot).not.toBeInTheDocument();
  });

  it("displays default tooltip", () => {
    render(<FilterControl {...defaultProps} />);
    expect(screen.getByText("Filtrar columna")).toBeInTheDocument();
  });

  it("displays custom tooltip", () => {
    render(<FilterControl {...defaultProps} tooltip="Custom filter" />);
    expect(screen.getByText("Custom filter")).toBeInTheDocument();
  });
});

// ─── VisibilityControl ──────────────────────────────────────────────────────

describe("VisibilityControl", () => {
  const defaultProps = {
    onToggle: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<VisibilityControl {...defaultProps} />);
    expect(screen.getByTestId("eye-icon")).toBeInTheDocument();
  });

  it("shows Eye icon when visible", () => {
    render(<VisibilityControl {...defaultProps} isVisible={true} />);
    expect(screen.getByTestId("eye-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("eye-off-icon")).not.toBeInTheDocument();
  });

  it("shows EyeOff icon when not visible", () => {
    render(<VisibilityControl {...defaultProps} isVisible={false} />);
    expect(screen.getByTestId("eye-off-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("eye-icon")).not.toBeInTheDocument();
  });

  it("calls onToggle when clicked", () => {
    render(<VisibilityControl {...defaultProps} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(defaultProps.onToggle).toHaveBeenCalledTimes(1);
  });

  it("does not call onToggle when disabled", () => {
    render(<VisibilityControl {...defaultProps} disabled={true} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(defaultProps.onToggle).not.toHaveBeenCalled();
  });

  it("shows 'Ocultar columna' tooltip when visible", () => {
    render(<VisibilityControl {...defaultProps} isVisible={true} />);
    expect(screen.getByText("Ocultar columna")).toBeInTheDocument();
  });

  it("shows 'Mostrar columna' tooltip when not visible", () => {
    render(<VisibilityControl {...defaultProps} isVisible={false} />);
    expect(screen.getByText("Mostrar columna")).toBeInTheDocument();
  });
});
