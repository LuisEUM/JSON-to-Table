import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { TableSearch } from "../table-search";
import type { Table } from "@tanstack/react-table";

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

// Mock useDebounce to return value immediately for testing
jest.mock("@/lib/hooks/use-debounce", () => ({
  useDebounce: (value: unknown) => value,
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Search: () => <span data-testid="search-icon" />,
  X: () => <span data-testid="clear-icon" />,
}));

function createMockTable(): Table<unknown> {
  return {
    getState: () => ({
      globalFilter: "",
    }),
    setGlobalFilter: jest.fn(),
  } as unknown as Table<unknown>;
}

describe("TableSearch", () => {
  it("renders search input with default placeholder", () => {
    const table = createMockTable();
    render(<TableSearch table={table} />);

    expect(screen.getByPlaceholderText("Buscar...")).toBeInTheDocument();
  });

  it("renders search input with custom placeholder", () => {
    const table = createMockTable();
    render(<TableSearch table={table} placeholder="Search here..." />);

    expect(screen.getByPlaceholderText("Search here...")).toBeInTheDocument();
  });

  it("renders search icon", () => {
    const table = createMockTable();
    render(<TableSearch table={table} />);

    expect(screen.getByTestId("search-icon")).toBeInTheDocument();
  });

  it("calls setGlobalFilter when typing", () => {
    const table = createMockTable();
    render(<TableSearch table={table} />);

    const input = screen.getByPlaceholderText("Buscar...");
    fireEvent.change(input, { target: { value: "test query" } });

    // Since useDebounce is mocked to return immediately, setGlobalFilter should be called
    expect(table.setGlobalFilter).toHaveBeenCalledWith("test query");
  });

  it("shows clear button when input has value", () => {
    const table = createMockTable();
    render(<TableSearch table={table} />);

    const input = screen.getByPlaceholderText("Buscar...");

    // Initially no clear button
    expect(screen.queryByLabelText("Limpiar b\u00fasqueda")).not.toBeInTheDocument();

    // Type something
    fireEvent.change(input, { target: { value: "hello" } });

    // Clear button should appear
    expect(screen.getByLabelText("Limpiar b\u00fasqueda")).toBeInTheDocument();
  });

  it("clears search value when clear button is clicked", () => {
    const table = createMockTable();
    render(<TableSearch table={table} />);

    const input = screen.getByPlaceholderText("Buscar...");

    // Type something
    fireEvent.change(input, { target: { value: "hello" } });

    // Click clear
    const clearButton = screen.getByLabelText("Limpiar b\u00fasqueda");
    fireEvent.click(clearButton);

    // Input should be empty
    expect(input).toHaveValue("");
    // setGlobalFilter should be called with empty string
    expect(table.setGlobalFilter).toHaveBeenCalledWith("");
  });
});
