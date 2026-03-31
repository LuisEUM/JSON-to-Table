/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "lib/alkitu-table/**/*.ts",
    "lib/alkitu-table/**/*.tsx",
    "!lib/alkitu-table/**/__tests__/**",
    "!lib/alkitu-table/**/index.ts",
    "!**/node_modules/**",
  ],
  coverageReporters: ["text", "lcov", "clover"],
  coverageThreshold: {
    global: {
      branches: 5,
      functions: 10,
      lines: 10,
      statements: 10,
    },
  },
  verbose: true,
  projects: [
    {
      displayName: "node",
      testEnvironment: "node",
      testMatch: ["**/*.test.ts"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
      },
      transform: {
        "^.+\\.tsx?$": [
          "ts-jest",
          {
            tsconfig: "tsconfig.json",
          },
        ],
      },
    },
    {
      displayName: "jsdom",
      testEnvironment: "jsdom",
      testMatch: ["**/*.test.tsx"],
      setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
      },
      transformIgnorePatterns: [
        "node_modules/(?!(lucide-react|@radix-ui)/)",
      ],
      transform: {
        "^.+\\.[jt]sx?$": [
          "ts-jest",
          {
            tsconfig: "tsconfig.test.json",
          },
        ],
      },
    },
  ],
};

module.exports = config;
