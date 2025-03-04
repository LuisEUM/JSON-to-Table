/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/app/$1",
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
    "app/**/*.ts",
    "app/**/*.tsx",
    "!app/tests/**/*.ts",
    "!app/tests/**/*.tsx",
    "!**/node_modules/**",
  ],
  coverageReporters: ["text", "lcov", "clover"],
  verbose: true,
  // Configuración específica para archivos .tsx
  projects: [
    {
      displayName: "node",
      testEnvironment: "node",
      testMatch: ["**/*.test.ts"],
    },
    {
      displayName: "jsdom",
      testEnvironment: "jsdom",
      testMatch: ["**/*.test.tsx"],
      setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    },
  ],
};

module.exports = config;
