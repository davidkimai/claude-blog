/**
 * Accessibility Testing Setup for ClawSpace
 * 
 * This file provides accessibility testing utilities using axe-core.
 * Run accessibility tests with: npm run test:a11y
 */

import { configure, injectAxe, checkA11y } from "@axe-core/react";
import { JSDOM } from "jsdom";

// Configure axe for React testing
configure({
  // Rules to run
  rules: [
    // Color contrast
    { id: "color-contrast", enabled: true },
    // Keyboard accessibility
    { id: "keyboard", enabled: true },
    { id: "tabindex", enabled: true },
    { id: "focus-order-semantics", enabled: true },
    { id: "focus-visible", enabled: true },
    // ARIA
    { id: "aria-required-attr", enabled: true },
    { id: "aria-required-children", enabled: true },
    { id: "aria-required-parent", enabled: true },
    { id: "aria-valid-attr-value", enabled: true },
    { id: "aria-valid-attr", enabled: true },
    // Images
    { id: "image-alt", enabled: true },
    { id: "alt", enabled: true },
    // Labels
    { id: "label", enabled: true },
    { id: "explicit-label", enabled: true },
    { id: "implicit-label", enabled: true },
    // Links
    { id: "link-name", enabled: true },
    // Buttons
    { id: "button-name", enabled: true },
    // Forms
    { id: "form-field-multiple-labels", enabled: true },
    { id: "select-name", enabled: true },
    { id: "input-button-name", enabled: true },
    { id: "input-image-alt", enabled: true },
    // Tables
    { id: "table", enabled: true },
    { id: "th-has-data-cells", enabled: true },
    // Other
    { id: "html-has-lang", enabled: true },
    { id: "html-lang-valid", enabled: true },
    { id: "landmark-one-main", enabled: true },
    { id: "region", enabled: true },
  ],
});

// Inject axe into the testing environment
injectAxe(JSDOM);

// Accessibility test helper
export async function runA11yTest(
  container: HTMLElement,
  context: string = "Component"
): Promise<{
  violations: any[];
  passes: any[];
  incomplete: any[];
}> {
  const results = await checkA11y(container, {
    runOnly: {
      type: "tag",
      values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
    },
  });

  return results;
}

// Format axe results for Jest/Playwright output
export function formatA11yResults(results: any[]): string {
  if (results.length === 0) {
    return "✅ No accessibility violations found";
  }

  const summary = results.map((result) => {
    const { id, impact, description, help, helpUrl, nodes } = result;
    
    const nodeDetails = nodes
      .map((node: any) => {
        const { target, failureSummary } = node;
        const selector = Array.isArray(target) ? target.join(" > ") : target;
        return `  - Selector: ${selector}\n    Issue: ${failureSummary}`;
      })
      .join("\n");

    return `
❌ [${id}] ${help}
   Impact: ${impact || "moderate"}
   Description: ${description}
   Help: ${helpUrl}
   ${nodeDetails}
    `.trim();
  }).join("\n\n");

  return `\n${summary}`;
}

// Jest matcher for accessibility
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAccessible(): R;
    }
  }
}

// Example usage in tests:
//
// test('Button is accessible', async () => {
//   const { container } = render(<Button>Click me</Button>);
//   const results = await runA11yTest(container, 'Button');
//   expect(results.violations).toHaveLength(0);
// });

// Playwright test example:
//
// test('Homepage accessibility', async ({ page }) => {
//   await page.goto('/');
//   const accessibilityScanResults = await new AxeBuilder(page).analyze();
//   expect(accessibilityScanResults.violations).toEqual([]);
// });

// Component-specific checklist
export const a11yChecklist = {
  button: [
    "Has accessible name (text content or aria-label)",
    "Focusable with keyboard",
    "Has visible focus indicator",
    "Not disabled without aria-disabled",
  ],
  input: [
    "Has associated label",
    "Focusable with keyboard",
    "Has visible focus indicator",
    "Error messages linked via aria-describedby",
  ],
  image: [
    "Has alt text (or alt='' for decorative)",
    "Informative alt describes content/purpose",
  ],
  link: [
    "Has accessible name",
    "Focusable with keyboard",
    "Not empty href",
  ],
  modal: [
    "Has aria-modal='true'",
    "Has role='dialog'",
    "Has aria-labelledby or aria-label",
    "Traps focus within dialog",
    "Closes on Escape key",
    "Returns focus on close",
  ],
  navigation: [
    "Has role='navigation' or semantic <nav>",
    "Unique accessible name if multiple navs",
    "Keyboard navigable",
  ],
  heading: [
    "Heading levels skip correctly (no h1 after h2)",
    "Heading text describes section content",
  ],
};
