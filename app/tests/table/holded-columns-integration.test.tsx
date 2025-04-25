import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { columns } from "../../table/columns/columns";
import { withHoldedStatusColumns } from "../../lib/holded/components/holded-status-columns";
import type { Customer } from "../../lib/holded/interfaces/customer";
import type { ColumnDef } from "@tanstack/react-table";
import type { ProcessedRow } from "../../table/data-processor";

// Mock the withHoldedStatusColumns function
jest.mock("../../lib/holded/components/holded-status-columns", () => ({
  withHoldedStatusColumns: jest.fn((cols) => {
    return [...cols, { id: "clientStatus", header: "Estado del Cliente" }];
  }),
}));

describe("Holded Status Columns Integration", () => {
  // Mock window.location
  const originalWindow = { ...window };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Restore window
    Object.defineProperty(global, "window", {
      value: originalWindow,
      writable: true,
    });
  });

  it("should add Holded status columns when source is holded and dataType is contacts", () => {
    // Mock window.location.href
    const mockUrl = new URL(
      "https://example.com/table?source=holded&dataType=contacts"
    );
    Object.defineProperty(window, "location", {
      value: { href: mockUrl.href },
      writable: true,
    });

    // Mock URL constructor
    global.URL = jest.fn(() => mockUrl) as any;

    // Mock data
    const mockData = [
      {
        id: "1",
        name: "Test Customer",
        email: "test@example.com",
        customFields: [],
      },
    ];

    // Call columns function
    const result = columns(mockData as any);

    // Verify withHoldedStatusColumns was called
    expect(withHoldedStatusColumns).toHaveBeenCalled();

    // Verify the result contains the clientStatus column
    const statusColumn = result.find((col) => col.id === "clientStatus");
    expect(statusColumn).toBeDefined();
    expect(statusColumn?.header).toBe("Estado del Cliente");
  });

  it("should not add Holded status columns for other data sources", () => {
    // Mock window.location.href
    const mockUrl = new URL(
      "https://example.com/table?source=other&dataType=contacts"
    );
    Object.defineProperty(window, "location", {
      value: { href: mockUrl.href },
      writable: true,
    });

    // Mock URL constructor
    global.URL = jest.fn(() => mockUrl) as any;

    // Mock data
    const mockData = [
      {
        id: "1",
        name: "Test Customer",
        email: "test@example.com",
      },
    ];

    // Call columns function
    const result = columns(mockData as any);

    // Verify withHoldedStatusColumns was not called
    expect(withHoldedStatusColumns).not.toHaveBeenCalled();

    // Verify the result does not contain the clientStatus column
    const statusColumn = result.find((col) => col.id === "clientStatus");
    expect(statusColumn).toBeUndefined();
  });
});
