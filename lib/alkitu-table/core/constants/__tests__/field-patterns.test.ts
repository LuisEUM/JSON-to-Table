import {
  matchesFieldPattern,
  isKnownField,
  OBJECT_FIELD_PATTERNS,
  KNOWN_OBJECT_FIELDS,
  DATE_FIELD_PATTERNS,
  BROAD_DATE_FIELD_PATTERNS,
  STANDARD_DATE_FIELDS,
  POSTAL_FIELD_PATTERNS,
  ID_FIELD_PATTERNS,
  TEXT_ARRAY_FIELD_PATTERNS,
  ARRAY_COLUMN_NAME_PATTERNS,
  FLATTEN_OBJECT_PATTERNS,
} from "../field-patterns";

describe("matchesFieldPattern", () => {
  it("returns true when field matches a pattern", () => {
    expect(matchesFieldPattern("billAddress", OBJECT_FIELD_PATTERNS)).toBe(
      true
    );
  });

  it("returns false when field does not match any pattern", () => {
    expect(matchesFieldPattern("somethingElse", OBJECT_FIELD_PATTERNS)).toBe(
      false
    );
  });

  it("returns true for empty patterns array (no patterns to match)", () => {
    expect(matchesFieldPattern("anything", [])).toBe(false);
  });
});

describe("isKnownField", () => {
  it("returns true for a known field", () => {
    expect(isKnownField("supplierRecord", KNOWN_OBJECT_FIELDS)).toBe(true);
  });

  it("returns true for billAddress", () => {
    expect(isKnownField("billAddress", KNOWN_OBJECT_FIELDS)).toBe(true);
  });

  it("returns true for clientRecord", () => {
    expect(isKnownField("clientRecord", KNOWN_OBJECT_FIELDS)).toBe(true);
  });

  it("returns false for unknown field", () => {
    expect(isKnownField("unknownField", KNOWN_OBJECT_FIELDS)).toBe(false);
  });

  it("returns false for empty known fields array", () => {
    expect(isKnownField("anything", [])).toBe(false);
  });
});

describe("OBJECT_FIELD_PATTERNS", () => {
  const testCases = [
    { field: "supplierRecord", expected: true },
    { field: "clientRecord", expected: true },
    { field: "billAddress", expected: true },
    { field: "shippingAddress", expected: true },
    { field: "user", expected: true },
    { field: "profile", expected: true },
    { field: "config", expected: true },
    { field: "settings", expected: true },
    { field: "simpleString", expected: false },
    { field: "count", expected: false },
  ];

  testCases.forEach(({ field, expected }) => {
    it(`${expected ? "matches" : "does not match"} "${field}"`, () => {
      expect(matchesFieldPattern(field, OBJECT_FIELD_PATTERNS)).toBe(expected);
    });
  });
});

describe("DATE_FIELD_PATTERNS", () => {
  const testCases = [
    { field: "createdAt", expected: true },
    { field: "updatedAt", expected: true },
    { field: "date", expected: true },
    { field: "timestamp", expected: true },
    { field: "name", expected: false },
    { field: "amount", expected: false },
  ];

  testCases.forEach(({ field, expected }) => {
    it(`${expected ? "matches" : "does not match"} "${field}"`, () => {
      expect(matchesFieldPattern(field, DATE_FIELD_PATTERNS)).toBe(expected);
    });
  });
});

describe("BROAD_DATE_FIELD_PATTERNS", () => {
  const testCases = [
    { field: "createdAt", expected: true },
    { field: "updatedAt", expected: true },
    { field: "fechaCreacion", expected: true },
    { field: "modifiedDate", expected: true },
    { field: "timestamp", expected: true },
    { field: "name", expected: false },
  ];

  testCases.forEach(({ field, expected }) => {
    it(`${expected ? "matches" : "does not match"} "${field}"`, () => {
      expect(matchesFieldPattern(field, BROAD_DATE_FIELD_PATTERNS)).toBe(
        expected
      );
    });
  });
});

describe("STANDARD_DATE_FIELDS", () => {
  it("includes createdAt", () => {
    expect(isKnownField("createdAt", STANDARD_DATE_FIELDS)).toBe(true);
  });

  it("includes updatedAt", () => {
    expect(isKnownField("updatedAt", STANDARD_DATE_FIELDS)).toBe(true);
  });

  it("does not include random field", () => {
    expect(isKnownField("randomField", STANDARD_DATE_FIELDS)).toBe(false);
  });
});

describe("POSTAL_FIELD_PATTERNS", () => {
  const testCases = [
    { field: "postal", expected: true },
    { field: "zip", expected: true },
    { field: "cp", expected: true },
    { field: "postcode", expected: true },
    { field: "address", expected: false },
  ];

  testCases.forEach(({ field, expected }) => {
    it(`${expected ? "matches" : "does not match"} "${field}"`, () => {
      expect(matchesFieldPattern(field, POSTAL_FIELD_PATTERNS)).toBe(expected);
    });
  });
});

describe("ID_FIELD_PATTERNS", () => {
  const testCases = [
    { field: "id", expected: true },
    { field: "_id", expected: true },
    { field: "userId", expected: true },
    { field: "userID", expected: true },
    { field: "idNumber", expected: true },
    { field: "name", expected: false },
  ];

  testCases.forEach(({ field, expected }) => {
    it(`${expected ? "matches" : "does not match"} "${field}"`, () => {
      expect(matchesFieldPattern(field, ID_FIELD_PATTERNS)).toBe(expected);
    });
  });
});

describe("TEXT_ARRAY_FIELD_PATTERNS", () => {
  const testCases = [
    { field: "notes", expected: true },
    { field: "comments", expected: true },
    { field: "notas", expected: true },
    { field: "comentarios", expected: true },
    { field: "title", expected: false },
  ];

  testCases.forEach(({ field, expected }) => {
    it(`${expected ? "matches" : "does not match"} "${field}"`, () => {
      expect(matchesFieldPattern(field, TEXT_ARRAY_FIELD_PATTERNS)).toBe(
        expected
      );
    });
  });
});

describe("ARRAY_COLUMN_NAME_PATTERNS", () => {
  const testCases = [
    { field: "orderItems", expected: true },
    { field: "itemList", expected: true },
    { field: "dataEntries", expected: true },
    { field: "simpleField", expected: false },
  ];

  testCases.forEach(({ field, expected }) => {
    it(`${expected ? "matches" : "does not match"} "${field}"`, () => {
      expect(matchesFieldPattern(field, ARRAY_COLUMN_NAME_PATTERNS)).toBe(
        expected
      );
    });
  });
});

describe("FLATTEN_OBJECT_PATTERNS", () => {
  const testCases = [
    { field: "billAddress", expected: true },
    { field: "shippingAddress", expected: true },
    { field: "supplierRecord", expected: true },
    { field: "plainField", expected: false },
  ];

  testCases.forEach(({ field, expected }) => {
    it(`${expected ? "matches" : "does not match"} "${field}"`, () => {
      expect(matchesFieldPattern(field, FLATTEN_OBJECT_PATTERNS)).toBe(
        expected
      );
    });
  });
});
