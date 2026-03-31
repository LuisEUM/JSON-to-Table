import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterFooter } from "../filter-footer";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Check: (props: Record<string, unknown>) =>
    React.createElement("svg", { "data-testid": "check-icon", ...props }),
  Trash2: (props: Record<string, unknown>) =>
    React.createElement("svg", { "data-testid": "trash-icon", ...props }),
  X: (props: Record<string, unknown>) =>
    React.createElement("svg", { "data-testid": "x-icon", ...props }),
  CheckSquare: (props: Record<string, unknown>) =>
    React.createElement("svg", { "data-testid": "check-square-icon", ...props }),
}));

// Mock Radix UI Tooltip
jest.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TooltipTrigger: React.forwardRef(
    (
      {
        children,
        asChild,
        ...props
      }: { children: React.ReactNode; asChild?: boolean },
      ref: React.Ref<HTMLDivElement>
    ) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    )
  ),
  TooltipProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock Button
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

describe("FilterFooter", () => {
  const defaultProps = {
    onClear: jest.fn(),
    onClose: jest.fn(),
    onApply: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<FilterFooter {...defaultProps} />);
    // Should render apply, close, and clear buttons (icons)
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
    expect(screen.getByTestId("x-icon")).toBeInTheDocument();
    expect(screen.getByTestId("trash-icon")).toBeInTheDocument();
  });

  it("calls onApply when apply button is clicked", () => {
    render(<FilterFooter {...defaultProps} />);
    const applyButton = screen.getByTestId("check-icon").closest("button")!;
    fireEvent.click(applyButton);
    expect(defaultProps.onApply).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when close button is clicked", () => {
    render(<FilterFooter {...defaultProps} />);
    const closeButton = screen.getByTestId("x-icon").closest("button")!;
    fireEvent.click(closeButton);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClear and onClose when clear button is clicked", () => {
    render(<FilterFooter {...defaultProps} />);
    const clearButton = screen.getByTestId("trash-icon").closest("button")!;
    fireEvent.click(clearButton);
    expect(defaultProps.onClear).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("hides clear button when showClear is false", () => {
    render(<FilterFooter {...defaultProps} showClear={false} />);
    expect(screen.queryByTestId("trash-icon")).not.toBeInTheDocument();
  });

  it("shows clear button by default", () => {
    render(<FilterFooter {...defaultProps} />);
    expect(screen.getByTestId("trash-icon")).toBeInTheDocument();
  });

  it("hides select all button by default", () => {
    render(
      <FilterFooter {...defaultProps} onSelectAll={jest.fn()} />
    );
    expect(screen.queryByTestId("check-square-icon")).not.toBeInTheDocument();
  });

  it("shows select all button when showSelectAll is true and onSelectAll is provided", () => {
    const onSelectAll = jest.fn();
    render(
      <FilterFooter
        {...defaultProps}
        onSelectAll={onSelectAll}
        showSelectAll={true}
      />
    );
    expect(screen.getByTestId("check-square-icon")).toBeInTheDocument();
  });

  it("calls onSelectAll when select all button is clicked", () => {
    const onSelectAll = jest.fn();
    render(
      <FilterFooter
        {...defaultProps}
        onSelectAll={onSelectAll}
        showSelectAll={true}
      />
    );
    const selectAllButton = screen
      .getByTestId("check-square-icon")
      .closest("button")!;
    fireEvent.click(selectAllButton);
    expect(onSelectAll).toHaveBeenCalledTimes(1);
  });

  it("triggers onApply on Enter key press", () => {
    render(<FilterFooter {...defaultProps} />);
    const container = screen.getByTestId("check-icon").closest("div")!;
    // Find the outermost div that has the onKeyDown handler
    const footerDiv = container.closest(".flex.items-center")!;
    fireEvent.keyDown(footerDiv, { key: "Enter" });
    expect(defaultProps.onApply).toHaveBeenCalledTimes(1);
  });

  it("triggers onClose on Escape key press", () => {
    render(<FilterFooter {...defaultProps} />);
    const container = screen.getByTestId("check-icon").closest("div")!;
    const footerDiv = container.closest(".flex.items-center")!;
    fireEvent.keyDown(footerDiv, { key: "Escape" });
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});
