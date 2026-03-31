import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { DetailsModal } from "../details-modal";
import type { ProcessedValue } from "../../../core/utils/data-processor";

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
  Code2: (props: Record<string, unknown>) =>
    React.createElement("svg", { "data-testid": "code-icon", ...props }),
  Table2: (props: Record<string, unknown>) =>
    React.createElement("svg", { "data-testid": "table-icon", ...props }),
}));

// Mock TypeDot
jest.mock("../../../atoms/indicators/TypeDot", () => ({
  TypeDot: ({ type }: { type: string }) => (
    <span data-testid={`type-dot-${type}`} />
  ),
}));

// Mock Dialog
jest.mock("@/components/primitives/ui/dialog", () => ({
  Dialog: ({
    children,
    open,
    onOpenChange,
  }: {
    children: React.ReactNode;
    open: boolean;
    onOpenChange?: (open: boolean) => void;
  }) =>
    open ? (
      <div data-testid="dialog" onClick={() => onOpenChange?.(false)}>
        {children}
      </div>
    ) : null,
  DialogContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="dialog-title">{children}</h2>
  ),
}));

jest.mock("@/components/primitives/ui/scroll-area", () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="scroll-area">{children}</div>
  ),
}));

jest.mock("@/components/primitives/ui/button", () => ({
  Button: React.forwardRef(
    (
      {
        children,
        onClick,
        title,
        ...props
      }: {
        children: React.ReactNode;
        onClick?: () => void;
        title?: string;
      },
      ref: React.Ref<HTMLButtonElement>
    ) => (
      <button ref={ref} onClick={onClick} title={title} {...props}>
        {children}
      </button>
    )
  ),
}));

jest.mock("@/components/primitives/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <h3 data-testid="card-title" className={className}>
      {children}
    </h3>
  ),
}));

jest.mock("@/components/primitives/ui/badge", () => ({
  Badge: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
    variant?: string;
  }) => (
    <span data-testid="badge" className={className}>
      {children}
    </span>
  ),
}));

describe("DetailsModal", () => {
  const mockData: ProcessedValue = {
    type: "object",
    value: {
      name: {
        type: "string",
        value: "John Doe",
        path: ["name"],
      },
      age: {
        type: "number",
        value: 30,
        path: ["age"],
      },
    },
  };

  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    data: mockData,
    title: "Test Details",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders when open", () => {
    render(<DetailsModal {...defaultProps} />);
    expect(screen.getByTestId("dialog")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<DetailsModal {...defaultProps} open={false} />);
    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });

  it("displays the title", () => {
    render(<DetailsModal {...defaultProps} />);
    expect(screen.getByText("Test Details")).toBeInTheDocument();
  });

  it("displays default title when none provided", () => {
    render(<DetailsModal {...defaultProps} title={undefined} />);
    expect(screen.getByText("Detalles")).toBeInTheDocument();
  });

  it("displays 'No hay datos disponibles' when data has no value", () => {
    render(
      <DetailsModal
        {...defaultProps}
        data={{ type: "null", value: null }}
      />
    );
    expect(
      screen.getByText("No hay datos disponibles")
    ).toBeInTheDocument();
  });

  it("displays 'No hay datos disponibles' when data is undefined", () => {
    render(<DetailsModal {...defaultProps} data={undefined} />);
    expect(
      screen.getByText("No hay datos disponibles")
    ).toBeInTheDocument();
  });

  it("renders field values from the data object", () => {
    render(<DetailsModal {...defaultProps} />);
    // Should display the field names (last path segment)
    expect(screen.getByText("name")).toBeInTheDocument();
    expect(screen.getByText("age")).toBeInTheDocument();
  });

  it("renders field values", () => {
    render(<DetailsModal {...defaultProps} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
  });

  it("has a toggle button for JSON view", () => {
    render(<DetailsModal {...defaultProps} />);
    // Should have a button to toggle JSON view
    const toggleButton = screen.getByTitle("Ver JSON");
    expect(toggleButton).toBeInTheDocument();
  });

  it("toggles between JSON and processed view", () => {
    render(<DetailsModal {...defaultProps} />);
    const toggleButton = screen.getByTitle("Ver JSON");
    fireEvent.click(toggleButton);
    // After toggle, should show JSON content
    // The button title changes to "Ver vista procesada"
    expect(
      screen.getByTitle("Ver vista procesada")
    ).toBeInTheDocument();
  });

  it("handles boolean values in data", () => {
    const dataWithBoolean: ProcessedValue = {
      type: "object",
      value: {
        active: {
          type: "boolean",
          value: true,
          path: ["active"],
        },
      },
    };
    render(<DetailsModal {...defaultProps} data={dataWithBoolean} />);
    expect(screen.getByText("S\u00ED")).toBeInTheDocument();
  });

  it("handles false boolean values", () => {
    const dataWithBoolean: ProcessedValue = {
      type: "object",
      value: {
        active: {
          type: "boolean",
          value: false,
          path: ["active"],
        },
      },
    };
    render(<DetailsModal {...defaultProps} data={dataWithBoolean} />);
    expect(screen.getByText("No")).toBeInTheDocument();
  });
});
