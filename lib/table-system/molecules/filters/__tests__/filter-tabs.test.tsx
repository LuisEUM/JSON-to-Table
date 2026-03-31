import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterTabs, useFilterTabs } from "../filter-tabs";

// Mock Radix UI Tabs
jest.mock("@/components/ui/tabs", () => ({
  Tabs: ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode;
    value: string;
    onValueChange: (v: string) => void;
  }) => (
    <div data-testid="tabs" data-value={value}>
      {children}
      {/* Expose onValueChange for testing */}
      <select
        data-testid="tabs-value-changer"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
      >
        <option value="todos">todos</option>
        <option value="activos">activos</option>
        <option value="inactivos">inactivos</option>
      </select>
    </div>
  ),
  TabsList: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => (
    <button data-testid={`tab-trigger-${value}`} data-value={value}>
      {children}
    </button>
  ),
  TabsContent: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <div data-testid={`tab-content-${value}`}>{children}</div>,
}));

describe("FilterTabs", () => {
  const defaultProps = {
    counts: { todos: 10, activos: 3, inactivos: 7 },
    children: {
      todos: <div data-testid="todos-content">All items</div>,
      activos: <div data-testid="activos-content">Active items</div>,
      inactivos: <div data-testid="inactivos-content">Inactive items</div>,
    },
  };

  it("renders without crashing", () => {
    render(<FilterTabs {...defaultProps} />);
    expect(screen.getByTestId("tabs")).toBeInTheDocument();
  });

  it("renders all three tab triggers", () => {
    render(<FilterTabs {...defaultProps} />);
    expect(screen.getByTestId("tab-trigger-todos")).toBeInTheDocument();
    expect(screen.getByTestId("tab-trigger-activos")).toBeInTheDocument();
    expect(screen.getByTestId("tab-trigger-inactivos")).toBeInTheDocument();
  });

  it("displays correct counts in tab labels", () => {
    render(<FilterTabs {...defaultProps} />);
    expect(screen.getByTestId("tab-trigger-todos")).toHaveTextContent(
      "Todos (10)"
    );
    expect(screen.getByTestId("tab-trigger-activos")).toHaveTextContent(
      "Activos (3)"
    );
    expect(screen.getByTestId("tab-trigger-inactivos")).toHaveTextContent(
      "Inactivos (7)"
    );
  });

  it("renders content for all tabs", () => {
    render(<FilterTabs {...defaultProps} />);
    expect(screen.getByTestId("todos-content")).toBeInTheDocument();
    expect(screen.getByTestId("activos-content")).toBeInTheDocument();
    expect(screen.getByTestId("inactivos-content")).toBeInTheDocument();
  });

  it("uses 'todos' as default tab", () => {
    render(<FilterTabs {...defaultProps} />);
    expect(screen.getByTestId("tabs")).toHaveAttribute("data-value", "todos");
  });

  it("uses custom default tab when provided", () => {
    render(<FilterTabs {...defaultProps} defaultTab="activos" />);
    expect(screen.getByTestId("tabs")).toHaveAttribute("data-value", "activos");
  });

  it("calls onTabChange when tab changes", () => {
    const onTabChange = jest.fn();
    render(<FilterTabs {...defaultProps} onTabChange={onTabChange} />);
    const changer = screen.getByTestId("tabs-value-changer");
    fireEvent.change(changer, { target: { value: "activos" } });
    expect(onTabChange).toHaveBeenCalledWith("activos");
  });
});

describe("useFilterTabs", () => {
  it("separates items into todos, activos, and inactivos", () => {
    const items = [
      { id: 1, name: "a" },
      { id: 2, name: "b" },
      { id: 3, name: "c" },
    ];
    const selected = [{ id: 1, name: "a" }];

    // Simple component to test the hook
    function TestComponent() {
      const { filteredItems, counts, isSelected } = useFilterTabs(
        items,
        selected,
        (item, sel) => item.id === sel.id
      );
      return (
        <div>
          <span data-testid="todos-count">{counts.todos}</span>
          <span data-testid="activos-count">{counts.activos}</span>
          <span data-testid="inactivos-count">{counts.inactivos}</span>
          <span data-testid="todos-items">
            {filteredItems.todos.map((i) => i.name).join(",")}
          </span>
          <span data-testid="activos-items">
            {filteredItems.activos.map((i) => i.name).join(",")}
          </span>
          <span data-testid="inactivos-items">
            {filteredItems.inactivos.map((i) => i.name).join(",")}
          </span>
          <span data-testid="is-selected-1">
            {isSelected(items[0]) ? "yes" : "no"}
          </span>
          <span data-testid="is-selected-2">
            {isSelected(items[1]) ? "yes" : "no"}
          </span>
        </div>
      );
    }

    render(<TestComponent />);
    expect(screen.getByTestId("todos-count")).toHaveTextContent("3");
    expect(screen.getByTestId("activos-count")).toHaveTextContent("1");
    expect(screen.getByTestId("inactivos-count")).toHaveTextContent("2");
    expect(screen.getByTestId("todos-items")).toHaveTextContent("a,b,c");
    expect(screen.getByTestId("activos-items")).toHaveTextContent("a");
    expect(screen.getByTestId("inactivos-items")).toHaveTextContent("b,c");
    expect(screen.getByTestId("is-selected-1")).toHaveTextContent("yes");
    expect(screen.getByTestId("is-selected-2")).toHaveTextContent("no");
  });

  it("uses default compare function when none provided", () => {
    const items = ["a", "b", "c"];
    const selected = ["a"];

    function TestComponent() {
      const { counts } = useFilterTabs(items, selected);
      return (
        <div>
          <span data-testid="activos-count">{counts.activos}</span>
          <span data-testid="inactivos-count">{counts.inactivos}</span>
        </div>
      );
    }

    render(<TestComponent />);
    expect(screen.getByTestId("activos-count")).toHaveTextContent("1");
    expect(screen.getByTestId("inactivos-count")).toHaveTextContent("2");
  });

  it("handles empty items array", () => {
    function TestComponent() {
      const { counts } = useFilterTabs([], []);
      return (
        <div>
          <span data-testid="todos-count">{counts.todos}</span>
          <span data-testid="activos-count">{counts.activos}</span>
        </div>
      );
    }

    render(<TestComponent />);
    expect(screen.getByTestId("todos-count")).toHaveTextContent("0");
    expect(screen.getByTestId("activos-count")).toHaveTextContent("0");
  });
});
