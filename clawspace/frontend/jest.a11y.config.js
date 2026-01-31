/**
 * Jest Accessibility Test Configuration
 */

module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/components/ui/__tests__/setup.ts"],
  testMatch: ["**/components/ui/__tests__/**/*.test.{ts,tsx}"],
  collectCoverageFrom: [
    "components/ui/**/*.{ts,tsx}",
    "!components/ui/__tests__/**",
    "!components/ui/index.ts",
  ],
  moduleNameMapper: {
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/lib/(.*)$": "<rootDir>/lib/$1",
  },
  transform: {
    "^.+\\.(ts|tsx)$": ["@swc/jest", { config: { jsc: { parser: { syntax: "typescript" } } } }],
  },
};
