import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { CellFactory } from "../cell-factory";
import type { ProcessedValue } from "../../../core/utils/data-processor";

// Mock lucide-react
jest.mock("lucide-react", () => ({
  Check: (props: Record<string, unknown>) =>
    React.createElement("svg", { "data-testid": "check-icon", ...props }),
  X: (props: Record<string, unknown>) =>
    React.createElement("svg", { "data-testid": "x-icon", ...props }),
  Link: (props: Record<string, unknown>) =>
    React.createElement("svg", { "data-testid": "link-icon", ...props }),
}));

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

// Mock date-utils isDate
jest.mock("../../../core/utils/date-utils", () => ({
  isDate: jest.fn((val: unknown) => {
    if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}/.test(val)) return true;
    return false;
  }),
  normalizeDate: jest.fn(),
  cleanStringValue: jest.fn(),
}));

// Mock date-formatter
jest.mock("../../../core/utils/date-formatter", () => ({
  formatDateString: jest.fn((val: string) => `formatted:${val}`),
}));

// Mock complex cell wrappers to simplify tests
jest.mock("../array-cell-wrapper", () => ({
  ArrayCellWrapper: ({ value }: { value: ProcessedValue }) => (
    <span data-testid="array-cell">{JSON.stringify(value.value)}</span>
  ),
}));

jest.mock("../object-cell-wrapper", () => ({
  ObjectCellWrapper: ({ value }: { value: ProcessedValue }) => (
    <span data-testid="object-cell">{JSON.stringify(value.value)}</span>
  ),
}));

function makeValue(value: unknown, type: string): ProcessedValue {
  return { value, type };
}

describe("CellFactory", () => {
  describe("routing to correct component", () => {
    it("renders TextCell for string values", () => {
      render(<CellFactory value={makeValue("hello", "string")} />);
      expect(screen.getByText("hello")).toBeInTheDocument();
    });

    it("renders NumberCell for number values", () => {
      const { container } = render(
        <CellFactory value={makeValue(42, "number")} />
      );
      expect(screen.getByText("42")).toBeInTheDocument();
      expect(container.querySelector(".font-mono")).toBeInTheDocument();
    });

    it("renders BooleanCell for boolean values", () => {
      render(<CellFactory value={makeValue(true, "boolean")} />);
      expect(screen.getByTestId("check-icon")).toBeInTheDocument();
    });

    it("renders DateCell for date values", () => {
      render(<CellFactory value={makeValue("2024-01-15", "date")} />);
      expect(screen.getByText("formatted:2024-01-15")).toBeInTheDocument();
    });

    it("renders ArrayCellWrapper for array values", () => {
      render(<CellFactory value={makeValue([1, 2, 3], "array")} />);
      expect(screen.getByTestId("array-cell")).toBeInTheDocument();
    });

    it("renders ObjectCellWrapper for object values", () => {
      render(
        <CellFactory value={makeValue({ key: "val" }, "object")} />
      );
      expect(screen.getByTestId("object-cell")).toBeInTheDocument();
    });
  });

  describe("null/undefined handling", () => {
    it("renders dash when value prop is null", () => {
      render(<CellFactory value={null as unknown as ProcessedValue} />);
      expect(screen.getByText("-")).toBeInTheDocument();
    });

    it("renders dash when value prop is undefined", () => {
      render(<CellFactory value={undefined as unknown as ProcessedValue} />);
      expect(screen.getByText("-")).toBeInTheDocument();
    });

    it("renders NullCell when value.value is null", () => {
      render(<CellFactory value={makeValue(null, "string")} />);
      expect(screen.getByText("null")).toBeInTheDocument();
    });

    it("renders NullCell when value.value is undefined", () => {
      render(<CellFactory value={makeValue(undefined, "string")} />);
      expect(screen.getByText("undefined")).toBeInTheDocument();
    });
  });

  describe("type correction", () => {
    it("detects real type even when marked type is wrong", () => {
      // Value is a number but marked as string
      const { container } = render(
        <CellFactory value={makeValue(99, "string")} />
      );
      // Should render as NumberCell with monospace font
      expect(container.querySelector(".font-mono")).toBeInTheDocument();
      expect(screen.getByText("99")).toBeInTheDocument();
    });
  });

  describe("reference handling", () => {
    it("renders ReferenceCell when isReference prop is true", () => {
      render(
        <CellFactory value={makeValue("ref-123", "string")} isReference />
      );
      expect(screen.getByText("ref-123")).toBeInTheDocument();
    });

    it("renders ReferenceCell when value.isReference is true", () => {
      const value: ProcessedValue = {
        value: "ref-456",
        type: "string",
        isReference: true,
      };
      render(<CellFactory value={value} />);
      expect(screen.getByText("ref-456")).toBeInTheDocument();
    });
  });
});
