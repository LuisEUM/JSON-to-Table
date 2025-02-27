/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
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
    "!app/tests/**/*.ts",
    "!**/node_modules/**",
  ],
  coverageReporters: ["text", "lcov", "clover"],
  verbose: true,
};

module.exports = config;
