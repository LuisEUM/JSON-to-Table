import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { TextCell } from "../text-cell";
import { NumberCell } from "../number-cell";
import { DateCell } from "../date-cell";
import { BooleanCell } from "../boolean-cell";
import { NullCell } from "../null-cell";
import type { ProcessedValue } from "../../../core/utils/data-processor";

// Mock lucide-react
jest.mock("lucide-react", () => ({
  Check: (props: Record<string, unknown>) =>
    React.createElement("svg", { "data-testid": "check-icon", ...props }),
  X: (props: Record<string, unknown>) =>
    React.createElement("svg", { "data-testid": "x-icon", ...props }),
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

// Mock date-formatter
jest.mock("../../../core/utils/date-formatter", () => ({
  formatDateString: jest.fn((val: string) => {
    // Simple mock: return a formatted date string
    if (val === "2024-01-15") return "15-01-2024";
    if (val === "invalid") throw new Error("Invalid date");
    return val;
  }),
}));

function makeValue(value: unknown, type: string): ProcessedValue {
  return { value, type };
}

describe("TextCell", () => {
  it("renders text value", () => {
    render(<TextCell value={makeValue("Hello World", "string")} />);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("renders number as string", () => {
    render(<TextCell value={makeValue(42, "string")} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders dash for null value", () => {
    render(<TextCell value={makeValue(null, "string")} />);
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("renders dash for undefined value", () => {
    render(<TextCell value={makeValue(undefined, "string")} />);
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("renders empty string", () => {
    const { container } = render(
      <TextCell value={makeValue("", "string")} />
    );
    const span = container.querySelector("span.text-sm");
    expect(span).toBeInTheDocument();
    expect(span!.textContent).toBe("");
  });
});

describe("NumberCell", () => {
  it("renders number value", () => {
    render(<NumberCell value={makeValue(42, "number")} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders decimal number", () => {
    render(<NumberCell value={makeValue(3.14, "number")} />);
    expect(screen.getByText("3.14")).toBeInTheDocument();
  });

  it("renders zero", () => {
    render(<NumberCell value={makeValue(0, "number")} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders negative number", () => {
    render(<NumberCell value={makeValue(-100, "number")} />);
    expect(screen.getByText("-100")).toBeInTheDocument();
  });

  it("renders dash for null value", () => {
    render(<NumberCell value={makeValue(null, "number")} />);
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("renders string value when NaN", () => {
    render(<NumberCell value={makeValue("not-a-number", "number")} />);
    expect(screen.getByText("not-a-number")).toBeInTheDocument();
  });

  it("uses monospace font", () => {
    const { container } = render(
      <NumberCell value={makeValue(42, "number")} />
    );
    const span = container.querySelector("span.font-mono");
    expect(span).toBeInTheDocument();
  });
});

describe("DateCell", () => {
  it("renders formatted date", () => {
    render(<DateCell value={makeValue("2024-01-15", "date")} />);
    expect(screen.getByText("15-01-2024")).toBeInTheDocument();
  });

  it("renders dash for null value", () => {
    render(<DateCell value={makeValue(null, "date")} />);
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("renders Invalid date for bad date string", () => {
    render(<DateCell value={makeValue("invalid", "date")} />);
    expect(screen.getByText("Invalid date")).toBeInTheDocument();
  });
});

describe("BooleanCell", () => {
  it("renders check icon for true", () => {
    render(<BooleanCell value={makeValue(true, "boolean")} />);
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
  });

  it("renders X icon for false", () => {
    render(<BooleanCell value={makeValue(false, "boolean")} />);
    expect(screen.getByTestId("x-icon")).toBeInTheDocument();
  });

  it("renders check icon for string true", () => {
    render(<BooleanCell value={makeValue("true", "boolean")} />);
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
  });

  it("renders X icon for string false", () => {
    render(<BooleanCell value={makeValue("false", "boolean")} />);
    expect(screen.getByTestId("x-icon")).toBeInTheDocument();
  });

  it("renders dash for null value", () => {
    render(<BooleanCell value={makeValue(null, "boolean")} />);
    expect(screen.getByText("-")).toBeInTheDocument();
  });
});

describe("NullCell", () => {
  it("renders null text for null type", () => {
    render(<NullCell value={makeValue(null, "null")} type="null" />);
    expect(screen.getByText("null")).toBeInTheDocument();
  });

  it("renders undefined text for undefined type", () => {
    render(
      <NullCell value={makeValue(undefined, "undefined")} type="undefined" />
    );
    expect(screen.getByText("undefined")).toBeInTheDocument();
  });

  it("renders with muted foreground style", () => {
    const { container } = render(
      <NullCell value={makeValue(null, "null")} type="null" />
    );
    const span = container.querySelector("span");
    expect(span!.classList.contains("text-muted-foreground")).toBe(true);
    expect(span!.classList.contains("italic")).toBe(true);
  });
});
