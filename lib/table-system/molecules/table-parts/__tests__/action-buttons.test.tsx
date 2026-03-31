import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { ActionButtons } from "../action-buttons";
import type { ProcessedRow } from "../../../core/utils/data-processor";

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
  MoreHorizontal: (props: Record<string, unknown>) =>
    React.createElement("svg", {
      "data-testid": "more-horizontal-icon",
      ...props,
    }),
  Copy: (props: Record<string, unknown>) =>
    React.createElement("svg", { "data-testid": "copy-icon", ...props }),
  Trash2: (props: Record<string, unknown>) =>
    React.createElement("svg", { "data-testid": "trash-icon", ...props }),
  FileSearch: (props: Record<string, unknown>) =>
    React.createElement("svg", {
      "data-testid": "file-search-icon",
      ...props,
    }),
  Code2: (props: Record<string, unknown>) =>
    React.createElement("svg", { "data-testid": "code-icon", ...props }),
  Table2: (props: Record<string, unknown>) =>
    React.createElement("svg", { "data-testid": "table-icon", ...props }),
}));

// Mock DetailsModal
jest.mock("../details-modal", () => ({
  DetailsModal: ({
    open,
    onOpenChange,
    title,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    data?: unknown;
  }) =>
    open ? (
      <div data-testid="details-modal">
        <span>{title}</span>
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    ) : null,
}));

// Mock Button
jest.mock("@/components/ui/button", () => ({
  Button: React.forwardRef(
    (
      {
        children,
        onClick,
        className,
        ...props
      }: {
        children: React.ReactNode;
        onClick?: () => void;
        className?: string;
        variant?: string;
      },
      ref: React.Ref<HTMLButtonElement>
    ) => (
      <button ref={ref} onClick={onClick} className={className} {...props}>
        {children}
      </button>
    )
  ),
}));

// Mock DropdownMenu
jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <button
      data-testid="dropdown-item"
      onClick={onClick}
      className={className}
    >
      {children}
    </button>
  ),
  DropdownMenuTrigger: React.forwardRef(
    (
      { children }: { children: React.ReactNode; asChild?: boolean },
      ref: React.Ref<HTMLDivElement>
    ) => (
      <div ref={ref} data-testid="dropdown-trigger">
        {children}
      </div>
    )
  ),
}));

// Mock AlertDialog
jest.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open: boolean;
    onOpenChange?: (open: boolean) => void;
  }) => (open ? <div data-testid="alert-dialog">{children}</div> : null),
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-content">{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-title">{children}</div>
  ),
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogAction: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <button data-testid="alert-dialog-action" onClick={onClick}>
      {children}
    </button>
  ),
  AlertDialogCancel: ({ children }: { children: React.ReactNode }) => (
    <button data-testid="alert-dialog-cancel">{children}</button>
  ),
}));

describe("ActionButtons", () => {
  const mockRow: ProcessedRow = {
    id: { id: "id", type: "string", value: "123", path: ["id"], isId: true },
    name: { id: "name", type: "string", value: "Test Item", path: ["name"] },
  };

  const mockRowWithoutId: ProcessedRow = {
    name: { id: "name", type: "string", value: "Test Item", path: ["name"] },
    age: { id: "age", type: "number", value: 25, path: ["age"] },
  };

  const defaultProps = {
    row: mockRow,
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("renders without crashing", () => {
    render(<ActionButtons {...defaultProps} />);
    expect(screen.getByTestId("dropdown-menu")).toBeInTheDocument();
  });

  it("renders the trigger button with MoreHorizontal icon", () => {
    render(<ActionButtons {...defaultProps} />);
    expect(screen.getByTestId("more-horizontal-icon")).toBeInTheDocument();
  });

  it("shows Copy ID option when row has an id field", () => {
    render(<ActionButtons {...defaultProps} />);
    expect(screen.getByText("Copiar ID")).toBeInTheDocument();
  });

  it("hides Copy ID option when row has no id field", () => {
    render(<ActionButtons row={mockRowWithoutId} onDelete={jest.fn()} />);
    expect(screen.queryByText("Copiar ID")).not.toBeInTheDocument();
  });

  it("shows Ver detalles option", () => {
    render(<ActionButtons {...defaultProps} />);
    expect(screen.getByText("Ver detalles")).toBeInTheDocument();
  });

  it("shows Eliminar option", () => {
    render(<ActionButtons {...defaultProps} />);
    expect(screen.getByText("Eliminar")).toBeInTheDocument();
  });

  it("copies ID to clipboard when Copy ID is clicked", () => {
    render(<ActionButtons {...defaultProps} />);
    const copyButton = screen.getByText("Copiar ID").closest("button")!;
    fireEvent.click(copyButton);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("123");
  });

  it("opens details modal when Ver detalles is clicked", () => {
    render(<ActionButtons {...defaultProps} />);
    const detailsButton = screen
      .getByText("Ver detalles")
      .closest("button")!;
    fireEvent.click(detailsButton);
    expect(screen.getByTestId("details-modal")).toBeInTheDocument();
  });

  it("opens delete confirmation dialog when Eliminar is clicked", () => {
    render(<ActionButtons {...defaultProps} />);
    const deleteButton = screen.getByText("Eliminar").closest("button")!;
    fireEvent.click(deleteButton);
    expect(screen.getByTestId("alert-dialog")).toBeInTheDocument();
    expect(
      screen.getByText("\u00BFEst\u00E1 seguro?")
    ).toBeInTheDocument();
  });

  it("calls onDelete when confirmed in alert dialog", () => {
    render(<ActionButtons {...defaultProps} />);
    // Open delete dialog
    const deleteButton = screen.getByText("Eliminar").closest("button")!;
    fireEvent.click(deleteButton);
    // Confirm deletion
    const confirmButton = screen.getByTestId("alert-dialog-action");
    fireEvent.click(confirmButton);
    expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
  });
});
