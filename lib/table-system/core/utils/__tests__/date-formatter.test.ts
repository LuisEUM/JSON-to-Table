import { formatDateString, toUTCDate } from "../date-formatter";

// Mock logger
jest.mock("../../services/logging-service", () => ({
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

describe("formatDateString", () => {
  it("formats a Date object to dd-mm-yyyy", () => {
    const date = new Date(2024, 0, 15); // Jan 15, 2024
    const result = formatDateString(date);
    expect(result).toBe("15-01-2024");
  });

  it("formats dd/mm/yyyy string to dd-mm-yyyy", () => {
    const result = formatDateString("15/01/2024");
    expect(result).toBe("15-01-2024");
  });

  it("formats dd-mm-yyyy string to dd-mm-yyyy (no change)", () => {
    const result = formatDateString("15-01-2024");
    expect(result).toBe("15-01-2024");
  });

  it("formats ISO string to dd-mm-yyyy", () => {
    const result = formatDateString("2024-01-15");
    // parseISO handles this as UTC, so result should be consistent
    expect(result).toMatch(/^\d{2}-\d{2}-2024$/);
  });

  it("formats numeric timestamp to dd-mm-yyyy", () => {
    // Jan 15, 2024 at midnight UTC
    const timestamp = new Date(2024, 0, 15).getTime();
    const result = formatDateString(timestamp);
    expect(result).toBe("15-01-2024");
  });

  it("pads single digit day and month", () => {
    const date = new Date(2024, 0, 5); // Jan 5, 2024
    const result = formatDateString(date);
    expect(result).toBe("05-01-2024");
  });

  it("handles d/m/yyyy format (single digit day/month)", () => {
    const result = formatDateString("5/1/2024");
    expect(result).toBe("05-01-2024");
  });

  it("returns original string for invalid date string", () => {
    const result = formatDateString("not-a-date");
    expect(result).toBe("not-a-date");
  });

  it("handles end of year date", () => {
    const date = new Date(2024, 11, 31); // Dec 31, 2024
    const result = formatDateString(date);
    expect(result).toBe("31-12-2024");
  });

  it("handles leap year date", () => {
    const date = new Date(2024, 1, 29); // Feb 29, 2024 (leap year)
    const result = formatDateString(date);
    expect(result).toBe("29-02-2024");
  });
});

describe("toUTCDate", () => {
  it("converts a Date object to UTC", () => {
    const date = new Date(Date.UTC(2024, 0, 15));
    const result = toUTCDate(date);
    expect(result).toBeInstanceOf(Date);
    expect(result.getUTCFullYear()).toBe(2024);
    expect(result.getUTCMonth()).toBe(0);
    expect(result.getUTCDate()).toBe(15);
  });

  it("converts an ISO string to UTC date", () => {
    const result = toUTCDate("2024-01-15T00:00:00Z");
    expect(result).toBeInstanceOf(Date);
    expect(result.getUTCFullYear()).toBe(2024);
    expect(result.getUTCMonth()).toBe(0);
    expect(result.getUTCDate()).toBe(15);
  });

  it("converts a numeric timestamp to UTC date", () => {
    const timestamp = Date.UTC(2024, 0, 15);
    const result = toUTCDate(timestamp);
    expect(result).toBeInstanceOf(Date);
    expect(result.getUTCFullYear()).toBe(2024);
  });

  it("returns invalid Date for invalid string input", () => {
    const result = toUTCDate("not-a-date");
    expect(isNaN(result.getTime())).toBe(true);
  });
});
