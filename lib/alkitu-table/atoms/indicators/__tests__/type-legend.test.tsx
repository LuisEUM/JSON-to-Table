import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { TypeLegend } from "../TypeLegend";

// Mock TypeDot
jest.mock("../TypeDot", () => ({
  TypeDot: React.memo(({ type }: { type: string }) => (
    <span data-testid={`type-dot-${type}`} />
  )),
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
      { children }: { children: React.ReactNode },
      ref: React.Ref<HTMLDivElement>
    ) => <div ref={ref}>{children}</div>
  ),
  TooltipProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("TypeLegend", () => {
  it("renders without crashing", () => {
    render(<TypeLegend />);
    // Should show at least some type labels
    expect(screen.getByText("Texto")).toBeInTheDocument();
    expect(screen.getByText("N\u00FAmero")).toBeInTheDocument();
    expect(screen.getByText("Booleano")).toBeInTheDocument();
  });

  it("displays all available types", () => {
    render(<TypeLegend />);
    expect(screen.getByText("Texto")).toBeInTheDocument();
    expect(screen.getByText("N\u00FAmero")).toBeInTheDocument();
    expect(screen.getByText("Booleano")).toBeInTheDocument();
    expect(screen.getByText("Fecha")).toBeInTheDocument();
    expect(screen.getByText("Nulo")).toBeInTheDocument();
    expect(screen.getByText("Indefinido")).toBeInTheDocument();
    expect(screen.getByText("Objeto")).toBeInTheDocument();
    expect(screen.getByText("Array")).toBeInTheDocument();
    expect(screen.getByText("Array de primitivos")).toBeInTheDocument();
    expect(screen.getByText("Array de objetos")).toBeInTheDocument();
  });

  it("renders a TypeDot for each type", () => {
    render(<TypeLegend />);
    expect(screen.getByTestId("type-dot-string")).toBeInTheDocument();
    expect(screen.getByTestId("type-dot-number")).toBeInTheDocument();
    expect(screen.getByTestId("type-dot-boolean")).toBeInTheDocument();
    expect(screen.getByTestId("type-dot-date")).toBeInTheDocument();
    expect(screen.getByTestId("type-dot-null")).toBeInTheDocument();
    expect(screen.getByTestId("type-dot-undefined")).toBeInTheDocument();
    expect(screen.getByTestId("type-dot-object")).toBeInTheDocument();
    expect(screen.getByTestId("type-dot-array")).toBeInTheDocument();
    expect(
      screen.getByTestId("type-dot-primitiveArray")
    ).toBeInTheDocument();
    expect(screen.getByTestId("type-dot-objectArray")).toBeInTheDocument();
  });
});
