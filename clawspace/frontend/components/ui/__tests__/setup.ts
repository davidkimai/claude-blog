/**
 * Test setup for accessibility testing
 */

import { injectAxe } from "@axe-core/react";
import { JSDOM } from "jsdom";
import "@testing-library/jest-dom";

// Inject axe-core into jsdom environment
async function setupAxe() {
  try {
    await injectAxe(JSDOM);
    console.log("✅ axe-core injected successfully");
  } catch (error) {
    console.warn("⚠️ axe-core injection skipped:", error);
  }
}

setupAxe();

// Extend Jest matchers for accessibility
expect.extend({
  toBeAccessible(received) {
    const pass = received.violations && received.violations.length === 0;
    return {
      pass,
      message: () =>
        pass
          ? "✅ Component passed accessibility checks"
          : `❌ Found ${received.violations?.length || 0} accessibility violations:\n${JSON.stringify(received.violations, null, 2)}`,
    };
  },
});

// Mock ResizeObserver for component tests
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};
