import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { TablePagination } from "../table-pagination";
import type { Table } from "@tanstack/react-table";

// Mock Radix UI Select (since it relies on Radix internals)
jest.mock("@/components/primitives/ui/select", () => ({
  Select: ({ children, onValueChange, value }: { children: React.ReactNode; onValueChange?: (v: string) => void; value?: string }) => (
    <div data-testid="select" data-value={value}>
      {children}
      {/* Expose onValueChange for testing */}
      <button data-testid="select-trigger-action" onClick={() => onValueChange?.("25")}>
        Change to 25
      </button>
    </div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-trigger">{children}</div>
  ),
  SelectValue: ({ placeholder }: { placeholder?: unknown }) => (
    <span data-testid="select-value">{String(placeholder)}</span>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid={`select-item-${value}`}>{children}</div>
  ),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  ChevronFirst: () => <span data-testid="icon-first" />,
  ChevronLast: () => <span data-testid="icon-last" />,
  ChevronLeft: () => <span data-testid="icon-prev" />,
  ChevronRight: () => <span data-testid="icon-next" />,
}));

function createMockTable(overrides: Partial<{
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  totalRows: number;
  filteredRows: number;
  selectedRows: number;
  columnFilters: unknown[];
  globalFilter: string;
}> = {}): Table<unknown> {
  const {
    pageIndex = 0,
    pageSize = 10,
    pageCount = 5,
    canPreviousPage = false,
    canNextPage = true,
    totalRows = 50,
    filteredRows = 50,
    selectedRows = 0,
    columnFilters = [],
    globalFilter = "",
  } = overrides;

  return {
    getState: () => ({
      pagination: { pageIndex, pageSize },
      columnFilters,
      globalFilter,
    }),
    getPageCount: () => pageCount,
    getCanPreviousPage: () => canPreviousPage,
    getCanNextPage: () => canNextPage,
    getCoreRowModel: () => ({
      rows: Array.from({ length: totalRows }, (_, i) => ({ id: String(i) })),
    }),
    getFilteredRowModel: () => ({
      rows: Array.from({ length: filteredRows }, (_, i) => ({ id: String(i) })),
    }),
    getSelectedRowModel: () => ({
      rows: Array.from({ length: selectedRows }, (_, i) => ({ id: String(i) })),
    }),
    setPageSize: jest.fn(),
    setPageIndex: jest.fn(),
    previousPage: jest.fn(),
    nextPage: jest.fn(),
  } as unknown as Table<unknown>;
}

describe("TablePagination", () => {
  it("renders page info", () => {
    const table = createMockTable();
    render(<TablePagination table={table} />);

    expect(screen.getByText("Rows per page")).toBeInTheDocument();
    expect(screen.getByText(/of 5/)).toBeInTheDocument();
  });

  it("renders total rows count", () => {
    const table = createMockTable({ totalRows: 100 });
    render(<TablePagination table={table} />);

    expect(screen.getByText("100 registros")).toBeInTheDocument();
  });

  it("shows filtered count when filters are active", () => {
    const table = createMockTable({
      totalRows: 100,
      filteredRows: 30,
      columnFilters: [{ id: "name", value: "test" }],
    });
    render(<TablePagination table={table} />);

    expect(screen.getByText("30 de 100 registros")).toBeInTheDocument();
  });

  it("shows selected count when rows are selected", () => {
    const table = createMockTable({ selectedRows: 5, totalRows: 50 });
    render(<TablePagination table={table} />);

    expect(screen.getByText(/5 seleccionados/)).toBeInTheDocument();
  });

  it("disables previous buttons on first page", () => {
    const table = createMockTable({ canPreviousPage: false });
    render(<TablePagination table={table} />);

    const buttons = screen.getAllByRole("button");
    // First and previous buttons should be disabled
    const firstButton = buttons.find((btn) =>
      btn.querySelector("[data-testid='icon-first']")
    );
    const prevButton = buttons.find((btn) =>
      btn.querySelector("[data-testid='icon-prev']")
    );

    expect(firstButton).toBeDisabled();
    expect(prevButton).toBeDisabled();
  });

  it("disables next buttons on last page", () => {
    const table = createMockTable({ canNextPage: false });
    render(<TablePagination table={table} />);

    const buttons = screen.getAllByRole("button");
    const nextButton = buttons.find((btn) =>
      btn.querySelector("[data-testid='icon-next']")
    );
    const lastButton = buttons.find((btn) =>
      btn.querySelector("[data-testid='icon-last']")
    );

    expect(nextButton).toBeDisabled();
    expect(lastButton).toBeDisabled();
  });

  it("calls nextPage when next button is clicked", () => {
    const table = createMockTable({ canNextPage: true });
    render(<TablePagination table={table} />);

    const buttons = screen.getAllByRole("button");
    const nextButton = buttons.find((btn) =>
      btn.querySelector("[data-testid='icon-next']")
    );

    fireEvent.click(nextButton!);
    expect(table.nextPage).toHaveBeenCalled();
  });

  it("calls previousPage when previous button is clicked", () => {
    const table = createMockTable({ canPreviousPage: true });
    render(<TablePagination table={table} />);

    const buttons = screen.getAllByRole("button");
    const prevButton = buttons.find((btn) =>
      btn.querySelector("[data-testid='icon-prev']")
    );

    fireEvent.click(prevButton!);
    expect(table.previousPage).toHaveBeenCalled();
  });

  it("calls setPageIndex(0) when first button is clicked", () => {
    const table = createMockTable({ canPreviousPage: true });
    render(<TablePagination table={table} />);

    const buttons = screen.getAllByRole("button");
    const firstButton = buttons.find((btn) =>
      btn.querySelector("[data-testid='icon-first']")
    );

    fireEvent.click(firstButton!);
    expect(table.setPageIndex).toHaveBeenCalledWith(0);
  });

  it("calls setPageSize when page size is changed", () => {
    const table = createMockTable();
    render(<TablePagination table={table} />);

    const changeTo25 = screen.getByTestId("select-trigger-action");
    fireEvent.click(changeTo25);

    expect(table.setPageSize).toHaveBeenCalledWith(25);
  });
});
